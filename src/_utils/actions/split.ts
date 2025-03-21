import {
	IBaseFacade,
	ISelectionInfo,
	IFrameFacade,
	IPlainTextFacade,
	ISelection,
	ITextWidgetFacade,
	PLAIN_TEXT_FACADE_TYPE,
	Position,
} from 'types';
import cutAndSplit from '../plainTextActions/cutAndSplit';
import correctSmartIndexes, {
	correctSmartIndexesByTarget,
} from './correctSmartIndexes';
import getSelectionInfo from './getEdgesInfo';
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
// export function splitChildrenBySelection(
// 	target: ITextWidgetFacade,
// 	frameFacade: IFrameFacade,
// 	force: boolean,
// 	selection: ISelection
// ): [IBaseFacade[], IBaseFacade[]];
// export function splitChildrenBySelection(
// 	target: ITextWidgetFacade,
// 	frameFacade: IFrameFacade,
// 	force: boolean,
// 	edgesInfo: ISelectionInfo
// ): [IBaseFacade[], IBaseFacade[]];
// export function splitChildrenBySelection(
// 	target: ITextWidgetFacade,
// 	frameFacade: IFrameFacade,
// 	force: boolean,
// 	selectionOrEdgesInfo: ISelection | ISelectionInfo
// ): [IBaseFacade[], IBaseFacade[]] {
// 	const edgesInfo: ISelectionInfo = resolveEdgesInfo(
// 		target,
// 		selectionOrEdgesInfo
// 	);

// 	const {
// 		startChild,
// 		endChild,
// 		startIndexRelativeToStartChild,
// 		endIndexRelativeToEndChild,
// 	} = edgesInfo;

// 	if (startChild === endChild) {
// 		// Разбиваем текст на 2 части, вырезая то, что находится в выделении
// 		const [leftText, rightText] = cutAndSplit(
// 			startChild.text,
// 			startIndexRelativeToStartChild,
// 			endIndexRelativeToEndChild
// 		);
// 		// Устанавливаем левую часть текста исходному виджету
// 		if (force) {
// 			startChild.insertTextForce(leftText, 0, startChild.text.length);
// 		} else {
// 			startChild.insertText(leftText, 0, startChild.text.length);
// 		}
// Получаем SmatrPath для нового PlainText виджета
// const newPlainTextSmartPath =
// 	cloneSmartPathOfTargetAndIncrementIfNeed(startChild);
// // Создаем новый PlainText с текстом правой части
// const newPlainTextFacade = frameFacade.widgetFacadeCreator(
// 	PLAIN_TEXT_FACADE_TYPE,
// 	newPlainTextSmartPath,
// 	{},
// 	[],
// 	rightText
// );

// 		// Делим детей текста по виджету в котором находится курсор.
// 		// Виджет с курсором остается слева.
// 		const [leftPart, rightPart] = splitChildrenByTarget(
// 			target.children,
// 			startChild,
// 			'after'
// 		);
// 		// Смещаем индексы правых виджетов, начиная с индекса нового PlainText виджета + 1
// 		correctSmartIndexes(rightPart, newPlainTextSmartPath.at(-1)[0]);
// 		// Получаем новых детей текстового виджета cправа
// 		const newRightPart = [newPlainTextFacade, ...rightPart];

// 		return [leftPart, newRightPart];
// 	} else {
// 		const [leftChildren, middleLeftChild, middleRightChild, rightChildren] =
// 			splitChildrenByCrossWidgetSelection(target, edgesInfo);

// 		middleLeftChild.insertText(
// 			'',
// 			startIndexRelativeToStartChild,
// 			middleLeftChild.text.length
// 		);
// 		middleRightChild.insertText('', 0, endIndexRelativeToEndChild);

// 		const leftPart = [...leftChildren, middleLeftChild];
// 		const rightPart = [middleRightChild, ...rightChildren];

// 		return [leftPart, rightPart];
// 	}
// }

/**
 * Выполняет разбиение по не схлопнутому селекшену.
 * Возвращает:
 * - виджеты до выделения внутри текстового виджета старта выделения,
 * - виджеты после выделения внутри текстового виджета конца выделения.
 * Индексы виджетов стоящих справа от выделения, в т. ч. PlainText правой границы выделения, корректируются
 * Виджеты находящиеся в середине выделения но не на границах вырезаются.
 */
export function splitChildrenBySelection(
	selection: ISelection
): [[...IBaseFacade[], IPlainTextFacade], [IPlainTextFacade, ...IBaseFacade[]]];
export function splitChildrenBySelection(
	selectionInfo: ISelectionInfo
): [[...IBaseFacade[], IPlainTextFacade], [IPlainTextFacade, ...IBaseFacade[]]];
export function splitChildrenBySelection(
	selectionOrEdgesInfo: ISelection | ISelectionInfo
): [
	[...IBaseFacade[], IPlainTextFacade],
	[IPlainTextFacade, ...IBaseFacade[]],
] {
	const selectionInfo: ISelectionInfo =
		resolveSelectionInfo(selectionOrEdgesInfo);

	const { start, end } = selectionInfo;

	const leftChildren = start.text.children.slice(
		0,
		start.plainTextIndexInParent
	);
	const rightChildren = end.text.children.slice(
		end.plainTextIndexInParent + 1
	);

	const middleLeftChild = start.plainText;
	let middleRightChild = end.plainText;

	if (middleLeftChild === middleRightChild) {
		const [_, rightText] = cutAndSplit(
			middleLeftChild.text,
			selectionInfo.start.plainTextOffset,
			selectionInfo.end.plainTextOffset
		);
		const newPlainTextSmartPath =
			cloneSmartPathOfTargetAndIncrementIfNeed(middleLeftChild);
		// Создаем новый PlainText с текстом правой части
		middleRightChild = start.text.frameFacade.widgetFacadeCreator(
			PLAIN_TEXT_FACADE_TYPE,
			newPlainTextSmartPath,
			{},
			[],
			rightText
		) as IPlainTextFacade;
	} else {
		// Удаляем текст до конечной каретки в плейн-тексте
		middleRightChild.insertText('', 0, end.plainTextOffset);
	}

	// Заменяем текст после стартовой каретки в плейн-тексте на вставляемый текст
	middleLeftChild.insertText(
		'',
		start.plainTextOffset,
		middleLeftChild.text.length
	);

	// Корректируем индексы правых элементов, на основе последнего левого
	correctSmartIndexesByTarget(middleLeftChild, [
		middleRightChild,
		...rightChildren,
	]);

	return [
		[...leftChildren, middleLeftChild],
		[middleRightChild, ...rightChildren],
	];
}

function resolveSelectionInfo(
	selectionOrEdgesInfo: ISelection | ISelectionInfo
): ISelectionInfo {
	return !!(selectionOrEdgesInfo as ISelection).anchorText
		? getSelectionInfo(selectionOrEdgesInfo as ISelection)
		: (selectionOrEdgesInfo as ISelectionInfo);
}
