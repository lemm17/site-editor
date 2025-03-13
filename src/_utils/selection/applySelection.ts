import { ICaretPosition, ISelection } from 'types';
import { default as isEmpty } from './isEmpty';
import { getCaretPosition, getInitialCaretPosition, setCaret } from './caret';

export default function applySelection(
	target: HTMLElement,
	selection: ISelection
): void {
	const fromRight = selection.direction === 'left';
	const fromLeft = selection.direction === 'right';

	let caretPosition: ICaretPosition;
	if (fromLeft || isEmpty(target)) {
		caretPosition = getInitialCaretPosition(target, 'left');
	} else if (fromRight) {
		caretPosition = getInitialCaretPosition(target, 'right');
	} else {
		caretPosition = getCaretPosition(target, selection);
	}

	setCaret(target, caretPosition);
}
