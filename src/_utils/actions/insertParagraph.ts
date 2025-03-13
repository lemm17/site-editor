import { IFrameFacade, ISelection, ITextWidgetFacade } from 'types';
import deepClone from '../deepClone';
import correctSmartIndexes, { correctParentIndex } from './correctSmartIndexes';
import getEdgesInfo from './getEdgesInfo';
import getWFByPath from './getWFByPath';
import cloneSmartPathOfTargetAndIncrementIfNeed from './incrementSmartPath';
import { splitChildrenBySelection, splitChildrenByTarget } from './split';

export default function insertParagraph(
	target: ITextWidgetFacade,
	frameFacade: IFrameFacade,
	selection: ISelection
): ITextWidgetFacade {
	const edgesInfo = getEdgesInfo(target, selection);

	// Получаем SmatrPath для нового текстового виджета
	const newSmartPath = cloneSmartPathOfTargetAndIncrementIfNeed(target, true);
	// Разбиваем детей текущего текста по выделению
	const [leftPart, rightPart] = splitChildrenBySelection(
		target,
		frameFacade,
		true,
		edgesInfo
	);
	// Полуаем смарт-индекс нового текстового виджета
	const newTextSmartIndex = newSmartPath.at(-1);
	// Изменяем индекс родителя у детей правой части на новый
	correctParentIndex(rightPart, newTextSmartIndex);
	// Перестраиваем собственные индексы детей правой части с 0
	correctSmartIndexes(rightPart, 0);
	// Создаем новый текстовый виджет
	const newText = frameFacade.widgetFacadeCreator(
		target.type,
		newSmartPath,
		deepClone(target.properties),
		rightPart
	);
	// Оставляем левую часть детей у исходного текстового виджета
	target.children = leftPart;

	// Получаем родителя исходного текстового виджета
	const parentPath = target.path.slice(0, -1);
	const parent = getWFByPath(frameFacade, parentPath);
	// Сплитим дочерок исходного текстового виджета, оставляя исходный в левой части
	const [leftPartOfParent, rightPartOfParent] = splitChildrenByTarget(
		parent.children,
		target,
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
