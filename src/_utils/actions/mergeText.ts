import { IFrameFacade, ITextWidgetFacade } from 'types';
import CFDFSTraverse from '../CFDFSTraverse';
import correctSmartIndexes, { correctParentIndex } from './correctSmartIndexes';
import getParent from './getParent';
import isTextFacade from './isTextFacade';
import removeWidget from './removeWidget';
import { splitChildrenByTarget } from './split';

export default function mergeText(
	target: ITextWidgetFacade,
	frameFacade: IFrameFacade,
	forward: boolean,
	onFindingCallback?: (foundedText: ITextWidgetFacade) => void
): void {
	const traverseDirection = forward ? 'right' : 'left';

	CFDFSTraverse(target, frameFacade, traverseDirection, (candidateText) => {
		if (isTextFacade(candidateText)) {
			if (onFindingCallback) {
				onFindingCallback(candidateText);
			}

			// Определяем текстовый фасад в который будем мержить детей
			const textToMerge = forward ? target : candidateText;
			// Определяем текстовый фасад который будет удален в результате операции
			const textToDelete = forward ? candidateText : target;

			// Левая часть виджета в который мержится. Останется без изменений
			const leftPart = textToMerge.children;
			// Будущая правая часть виджета в который мержится
			const rightPart = textToDelete.children;

			const textToMergeSmartIndex = textToMerge.smartPath.at(-1);
			// Изменяем индекс родителя правой части, поскольку она будет перенесена
			correctParentIndex(rightPart, textToMergeSmartIndex);
			// Изменяем собственные индексы правой части
			correctSmartIndexes(rightPart, leftPart.length);
			// Объединяем содержимое кандидата и таргета
			const mergedChildren = [...leftPart, ...rightPart];

			// Устанавливаем новое смерженное содержимое в нужный виджет
			textToMerge.children = mergedChildren;

			// Удаляем виджет откуда утащили контент
			removeWidget(textToDelete, frameFacade);

			// Останавливаем проход по дереву
			return true;
		}
	});
}
