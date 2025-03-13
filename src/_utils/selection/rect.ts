import { ICaretPosition } from 'types';
import { getCoords } from './coords';
import { getDeepestElement } from './textNodes';

export function getCaretRectAtPosition({
	node,
	offset,
}: ICaretPosition): Omit<DOMRect, 'toJSON'> {
	const range = new Range();
	range.setEnd(node, offset);
	range.collapse();
	return getCursorRect(range, window.getSelection());
}

export function getFirstNodeRect(target: HTMLElement): DOMRect {
	const firstDeepestNode = getDeepestElement(target, 'left');
	return firstDeepestNode.getClientRects()[0];
}

export function getLastNodeRect(target: HTMLElement): DOMRect {
	const lastDeepestNode = getDeepestElement(target, 'right');
	const lastNodeRects = lastDeepestNode.getClientRects();
	return lastNodeRects[lastNodeRects.length - 1];
}

export function getCursorRect(
	range: Range,
	selection: Selection
): Omit<DOMRect, 'toJSON'> {
	if (!range) {
		return null;
	}

	const { focusNode, focusOffset } = selection;
	const TO_START = true;
	if (
		focusNode === range.startContainer &&
		focusOffset === range.startOffset
	) {
		range.collapse(TO_START);
	} else {
		range.collapse(!TO_START);
	}

	fixCoordsIfNeed(range);

	const rects = range.getClientRects();
	if (rects.length) {
		return rects[rects.length - 1];
	}

	// Если нет rect каретки, возвращаем rect начала первой строки сфокусированного DOM элемента.
	const startContainer = range.startContainer as HTMLElement;
	const startContainerRects = startContainer.getClientRects
		? startContainer.getClientRects()
		: startContainer.parentElement?.getClientRects();

	const resultRect: DOMRect = startContainerRects[0] ?? ({} as DOMRect);
	return {
		bottom: resultRect.bottom,
		height: resultRect.height,
		left: resultRect.left,
		top: resultRect.top,
		x: resultRect.x,
		y: resultRect.y,
		right: resultRect.right - resultRect.width,
		width: 0,
	};
}

function fixCoordsIfNeed(range: Range): void {
	const cloneRange = range.cloneRange();
	pushRangeOffset(cloneRange);

	const candidateToFixedFocusTop = getCoords(cloneRange, true)?.y;
	const nativeCoordsTop = getCoords(range, true)?.y;

	if (nativeCoordsTop !== candidateToFixedFocusTop) {
		pushRangeOffset(range);
	}
}

function pushRangeOffset(range: Range): void {
	range.setStart(
		range.startContainer,
		Math.min((range.startContainer as Text).length, range.startOffset + 1)
	);
}
