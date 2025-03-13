import { getRange } from './range';
import { isTextNode } from './textNodes';

export function getRangeCoords(): { startX: number; endX: number } {
	return {
		startX: getCoords(getRange(), true).x,
		endX: getCoords(getRange()).x,
	};
}

export function getCoords(
	range: Range,
	atStart: boolean = false
): { x: number; y: number } {
	const clone = range.cloneRange();

	if (!range.getClientRects) {
		return null;
	}

	clone.collapse(atStart);
	let rect = clone.getClientRects()[0];

	if (!rect) {
		const problemNode = atStart ? clone.startContainer : clone.endContainer;

		if (!isTextNode(problemNode)) {
			rect =
				(problemNode as HTMLElement).getClientRects()[0] ||
				(problemNode as HTMLElement).getBoundingClientRect();
		} else {
			return null;
		}
	}

	return {
		x: rect.x,
		y: rect.y,
	};
}
