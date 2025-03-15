import { ICaretPosition, ISelection, ITextWidgetFacade } from 'types';
import { default as isEmpty } from './isEmpty';
import {
	getCaretPosition,
	getInitialCaretPosition,
	setCaret,
	searchCaretPositionByOffset,
	searchCaretPositionBySelection,
} from './caret';

export default function applySelection(
	target: HTMLElement,
	textFacade: ITextWidgetFacade,
	selection: ISelection
): void {
	const fromRight = selection.direction === 'left';
	const fromLeft = selection.direction === 'right';

	let caretPosition: ICaretPosition;
	if (fromLeft || isEmpty(target)) {
		caretPosition = getInitialCaretPosition(target, 'start');
	} else if (fromRight) {
		caretPosition = getInitialCaretPosition(target, 'end');
	} else {
		const startSearchFrom = selection.direction === 'up' ? 'end' : 'start';
		if (selection.offset) {
			caretPosition = getCaretPosition(
				target,
				startSearchFrom,
				searchCaretPositionByOffset,
				selection.offset
			);
		} else {
			// TODO: Тут должно возвращаться левая и правая позиция каретки
			// сейчас возвращается только одна. Нужно исправить.
			// Пока не привело ни к каким сайд-эффектам
			caretPosition = getCaretPosition(
				target,
				startSearchFrom,
				searchCaretPositionBySelection,
				selection,
				textFacade
			);
		}
	}

	setCaret(target, caretPosition);
}
