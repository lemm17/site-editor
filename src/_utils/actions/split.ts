import {
	IBaseFacade,
	IEdgesInfo,
	IFrameFacade,
	IPlainTextFacade,
	ISelection,
	ITextWidgetFacade,
	PLAIN_TEXT_FACADE_TYPE,
	Position,
} from 'types';
import cutAndSplit from '../plainTextActions/cutAndSplit';
import correctSmartIndexes from './correctSmartIndexes';
import getEdgesInfo from './getEdgesInfo';
import cloneSmartPathOfTargetAndIncrementIfNeed from './incrementSmartPath';

/**
 * Разбивает дочерние виджеты на 2 части по таргету.
 * Таргет остается либо в левой, либо в правой, в зависимости от позиции.
 * Если позиция не указана, таргет не включается в результат.
 */
export function splitChildrenByTarget(
	children: IBaseFacade[],
	target: IBaseFacade,
	position: Position = null
): [IBaseFacade[], IBaseFacade[]] {
	const targetIndexInParent = target.path.at(-1);

	if (!position) {
		const rightPart = children.slice(targetIndexInParent + 1);
		const leftPart = children.slice(0, targetIndexInParent);

		return [leftPart, rightPart];
	}

	const rightPart =
		position === 'before'
			? children.slice(targetIndexInParent)
			: children.slice(targetIndexInParent + 1);
	const leftPart =
		position === 'before'
			? children.slice(0, targetIndexInParent)
			: children.slice(0, targetIndexInParent + 1);

	return [leftPart, rightPart];
}

/**
 * Выполняет разбитие по выделению, удаляя лишний текст.
 * Если выделение схлопнуто в одном IPlainText виджете:
 * - Вернет виджеты слева от выделения с исходным PlainTextFacade с текстом до выделения
 * - Вернет виджеты справа от выделения с новым PlainTextFacade с текстом после выделения
 * Иначе:
 * - Вернет виджеты слева от выделения с исходным PlainTextFacade с текстом до выделения
 * - Вернет виджеты после выделения с исходным PlainTextFacade с текстом после выделения
 */
export function splitChildrenBySelection(
	target: ITextWidgetFacade,
	frameFacade: IFrameFacade,
	force: boolean,
	selection: ISelection
): [IBaseFacade[], IBaseFacade[]];
export function splitChildrenBySelection(
	target: ITextWidgetFacade,
	frameFacade: IFrameFacade,
	force: boolean,
	edgesInfo: IEdgesInfo
): [IBaseFacade[], IBaseFacade[]];
export function splitChildrenBySelection(
	target: ITextWidgetFacade,
	frameFacade: IFrameFacade,
	force: boolean,
	selectionOrEdgesInfo: ISelection | IEdgesInfo
): [IBaseFacade[], IBaseFacade[]] {
	const edgesInfo: IEdgesInfo = resolveEdgesInfo(target, selectionOrEdgesInfo);

	const {
		startChild,
		endChild,
		startIndexRelativeToStartChild,
		endIndexRelativeToEndChild,
	} = edgesInfo;

	if (startChild === endChild) {
		// Разбиваем текст на 2 части, вырезая то, что находится в выделении
		const [leftText, rightText] = cutAndSplit(
			startChild.text,
			startIndexRelativeToStartChild,
			endIndexRelativeToEndChild
		);
		// Устанавливаем левую часть текста исходному виджету
		if (force) {
			startChild.insertTextForce(leftText, 0, startChild.text.length);
		} else {
			startChild.insertText(leftText, 0, startChild.text.length);
		}
		// Получаем SmatrPath для нового PlainText виджета
		const newPlainTextSmartPath =
			cloneSmartPathOfTargetAndIncrementIfNeed(startChild);
		// Создаем новый PlainText с текстом правой части
		const newPlainTextFacade = frameFacade.widgetFacadeCreator(
			PLAIN_TEXT_FACADE_TYPE,
			newPlainTextSmartPath,
			{},
			[],
			rightText
		);

		// Делим детей текста по виджету в котором находится курсор.
		// Виджет с курсором остается слева.
		const [leftPart, rightPart] = splitChildrenByTarget(
			target.children,
			startChild,
			'after'
		);
		// Смещаем индексы правых виджетов, начиная с индекса нового PlainText виджета + 1
		correctSmartIndexes(rightPart, newPlainTextSmartPath.at(-1)[0]);
		// Получаем новых детей текстового виджета cправа
		const newRightPart = [newPlainTextFacade, ...rightPart];

		return [leftPart, newRightPart];
	} else {
		const [leftChildren, middleLeftChild, middleRightChild, rightChildren] =
			splitChildrenByCrossWidgetSelection(target, edgesInfo);

		middleLeftChild.insertText(
			'',
			startIndexRelativeToStartChild,
			middleLeftChild.text.length
		);
		middleRightChild.insertText('', 0, endIndexRelativeToEndChild);

		const leftPart = [...leftChildren, middleLeftChild];
		const rightPart = [middleRightChild, ...rightChildren];

		return [leftPart, rightPart];
	}
}

/**
 * Выполняет разбиение по не схлопнутому селекшену.
 * Возвращает:
 * - виджеты до выделения,
 * - виджет в котором находится старт выделения,
 * - виджет в котором находится конец выделения и
 * - виджеты после выделения.
 * Текст PlainText-виджетов, находящихся на границах выделения, не модифицируется.
 * Индексы виджетов стоящих справа от выделения, в т. ч. PlainText правой границы выделения, корректируются
 * Виджеты находящиеся в середине выделения но не на границах вырезаются.
 */
export function splitChildrenByCrossWidgetSelection(
	target: ITextWidgetFacade,
	selection: ISelection
): [IBaseFacade[], IPlainTextFacade, IPlainTextFacade, IBaseFacade[]];
export function splitChildrenByCrossWidgetSelection(
	target: ITextWidgetFacade,
	edgesInfo: IEdgesInfo
): [IBaseFacade[], IPlainTextFacade, IPlainTextFacade, IBaseFacade[]];
export function splitChildrenByCrossWidgetSelection(
	target: ITextWidgetFacade,
	selectionOrEdgesInfo: ISelection | IEdgesInfo
): [IBaseFacade[], IPlainTextFacade, IPlainTextFacade, IBaseFacade[]] {
	const edgesInfo: IEdgesInfo = resolveEdgesInfo(target, selectionOrEdgesInfo);

	const {
		startChild,
		endChild,
		startChildIndexInParent,
		endChildIndexInParent,
	} = edgesInfo;

	const leftChildren = target.children.slice(0, startChildIndexInParent);
	const rightChildren = target.children.slice(endChildIndexInParent + 1);

	const middleLeftChild = startChild;
	const middleRightChild = endChild;

	// Корректируем индексы правых элементов, начиная с индекса middleLeftChild + 1
	const startOfNewIndex = middleLeftChild.path.at(-1) + 1;
	correctSmartIndexes([middleRightChild, ...rightChildren], startOfNewIndex);

	return [leftChildren, middleLeftChild, middleRightChild, rightChildren];
}

function resolveEdgesInfo(
	target: ITextWidgetFacade,
	selectionOrEdgesInfo: ISelection | IEdgesInfo
): IEdgesInfo {
	return !!(selectionOrEdgesInfo as ISelection).anchor
		? getEdgesInfo(target, selectionOrEdgesInfo as ISelection)
		: (selectionOrEdgesInfo as IEdgesInfo);
}
