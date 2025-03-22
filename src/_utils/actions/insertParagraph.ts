import { ISelection, ITextWidgetFacade } from 'types';
import deepClone from '../deepClone';
import correctSmartIndexes, {
	correctParentInChildren,
} from './correctSmartIndexes';
import getSelectionInfo from './getEdgesInfo';
import getParent from './getParent';
import cloneSmartPathOfTargetAndIncrementIfNeed from './incrementSmartPath';
import { splitChildrenBySelection, splitChildrenByTarget } from './split';
import removeWidget from './removeWidget';

export default function insertParagraph(
	selection: ISelection
): ITextWidgetFacade {
	const frameFacade = selection.anchorText.frameFacade;
	const edgesInfo = getSelectionInfo(selection);

	// Получаем SmartPath для нового текстового виджета относительно
	// виджета текста в котором находится старт выделения
	const newSmartPath = cloneSmartPathOfTargetAndIncrementIfNeed(
		edgesInfo.start.text,
		true
	);
	// Разбиваем детей текущего текста по выделению
	const [leftPart, rightPart] = splitChildrenBySelection(edgesInfo);
	// Полуаем смарт-индекс нового текстового виджета
	const newTextSmartIndex = newSmartPath.at(-1);

	// Создаем новый текстовый виджет
	const newText = frameFacade.widgetFacadeCreator(
		edgesInfo.start.text.type,
		newSmartPath,
		deepClone(edgesInfo.start.text.properties),
		rightPart
	) as ITextWidgetFacade;

	// Изменяем индекс родителя у детей правой части на новый
	correctParentInChildren(newText, rightPart);
	// Перестраиваем собственные индексы детей правой части с 0
	correctSmartIndexes(rightPart, 0);
	// Оставляем левую часть детей у исходного текстового виджета
	edgesInfo.start.text.children = leftPart;

	// Удаляем все, что между выделением
	edgesInfo.middle.forEach((widget) => {
		removeWidget(widget);
	});

	// Удаляем текстовый виджет конца выделения, если края выделения в разных текстовых виджетах
	if (edgesInfo.start.text !== edgesInfo.end.text) {
		removeWidget(edgesInfo.end.text);
	}

	// Получаем родителя исходного текстового виджета
	const parent = getParent(edgesInfo.start.text);
	// Сплитим дочерок исходного текстового виджета, оставляя исходный в левой части
	const [leftPartOfParent, rightPartOfParent] = splitChildrenByTarget(
		parent.children,
		edgesInfo.start.text,
		'after'
	);
	// Перестраиваем собственные индексы детей правой части родителя с индекса нового текста + 1
	correctSmartIndexes(rightPartOfParent, newTextSmartIndex[0] + 1);

	// Получаем обновленных настроенных детей родителя
	const newChildrenOfParent = [
		...leftPartOfParent,
		newText,
		...rightPartOfParent,
	];

	// Устанавливаем
	parent.children = newChildrenOfParent;

	return newText;
}
