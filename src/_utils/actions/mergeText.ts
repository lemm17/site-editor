import { ITextWidgetFacade } from 'types';
import CFDFSTraverse from '../CFDFSTraverse';
import correctSmartIndexes, {
	correctParentInChildren,
} from './correctSmartIndexes';
import isTextFacade from './isTextFacade';
import removeWidget, {
	getParentChildrenWithoutTargetAndCorrectIndexes,
} from './removeWidget';
import { TextWrapperFacade } from 'entities';
import cloneSmartPathOfTargetAndIncrementIfNeed from './incrementSmartPath';
import isFrameFacade from './isFrameFacade';
import getParent from './getParent';

type TextFacadeToSelectionApplying = ITextWidgetFacade;
type OffsetToSelectionApplying = number;

export default function mergeText(
	target: ITextWidgetFacade,
	forward: boolean
): [TextFacadeToSelectionApplying, OffsetToSelectionApplying] {
	const backward = !forward;
	const traverseDirection = forward ? 'right' : 'left';

	// Элемент для применения выделения после выполнения процедуры
	let textToMerge: TextFacadeToSelectionApplying;
	// Смещение для применения выделения после выполнения процедуры
	let selectionOffset: OffsetToSelectionApplying;
	CFDFSTraverse(target, traverseDirection, (candidate) => {
		const isTextWrapper = candidate instanceof TextWrapperFacade;
		const isParentOfTarget = candidate.children.includes(target);
		if (
			(isTextWrapper || isFrameFacade(candidate)) &&
			!isParentOfTarget &&
			backward
		) {
			// Определяем смещение для последующего применения на выделении
			selectionOffset = 0;
			// Определяем текстовый фасад в который будем мержить детей
			textToMerge = target;
			// Получаем парента таргета
			const parentOfTarget = getParent(target);
			// Удаляем таргет из текущей обертки. Будем выносить его в вышестоящую обертку
			// Вызываем функцию без применения новых детей!!
			// Иначе вызовется обработчик изменения детей у обертки и она может самовыпилиться
			// Установим содержимое родителя в конце обработки
			const parentChildrenWithoutTarget =
				getParentChildrenWithoutTargetAndCorrectIndexes(
					target,
					parentOfTarget
				);
			// Правой частью будет текущее содержимое верхней обертки
			const rightPart = candidate.children;
			// Смарт-путь текстового фасада будет равен смарт-пути первого элемента
			const newTextToMergeSmartPath =
				cloneSmartPathOfTargetAndIncrementIfNeed(rightPart[0], false);
			target.smartPath = newTextToMergeSmartPath;
			// Левой частью будет текущий виджет - выносим его наверх
			const leftPart = [target];
			// Правим индексы правых элементов
			correctSmartIndexes(rightPart, leftPart.length);
			// Устанавливаем новое содержимое верхней обертке
			candidate.children = [...leftPart, ...rightPart];
			// Устанавливаем новое содержимое родительской обертке
			// Теперь она может самовыпилиться, если хочет :)
			parentOfTarget.children = parentChildrenWithoutTarget;
			return true;
		}

		if (isTextFacade(candidate)) {
			// Определяем текстовый фасад в который будем мержить детей
			textToMerge = forward ? target : candidate;
			// Определяем смещение для последующего применения на выделении
			selectionOffset = textToMerge.length;
			// Определяем текстовый фасад который будет удален в результате операции
			const textToDelete = forward ? candidate : target;

			// Левая часть виджета в который мержится. Останется без изменений
			const leftPart = textToMerge.children;
			// Будущая правая часть виджета в который мержится
			const rightPart = textToDelete.children;

			const textToMergeSmartIndex = textToMerge.smartPath.at(-1);
			// Изменяем индекс родителя правой части, поскольку она будет перенесена
			correctParentInChildren(textToMerge, rightPart);
			// Изменяем собственные индексы правой части
			correctSmartIndexes(rightPart, leftPart.length);
			// Объединяем содержимое кандидата и таргета
			const mergedChildren = [...leftPart, ...rightPart];

			// Устанавливаем новое смерженное содержимое в нужный виджет
			textToMerge.children = mergedChildren;

			// Удаляем виджет откуда утащили контент
			removeWidget(textToDelete);

			// Останавливаем проход по дереву
			return true;
		}
	});

	return [textToMerge, selectionOffset];
}
