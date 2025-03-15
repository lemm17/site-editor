import { allowedInputTypes } from './constants';

export function isAllowedInputType(
	type: string
): type is (typeof allowedInputTypes)[number] {
	return allowedInputTypes.includes(
		type as (typeof allowedInputTypes)[number]
	);
}

export function deleteZeroWidthSpaceIfNeed(e: InputEvent): void {
	
}

export function ignoreZeroWidthSpaceIfNeed(e: KeyboardEvent): void {
	if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
		return;
	}

	const selection = document.getSelection();

	let newAnchorOffset = selection.anchorOffset;
	let newFocusOffset = selection.focusOffset;

	if (selection.focusNode.textContent === '\u200b') {
		if (e.key === 'ArrowLeft' && selection.focusOffset === 1) {
			newFocusOffset = 0;
		} else if (e.key === 'ArrowRight' && selection.focusOffset === 0) {
			newFocusOffset = 1;
		}
	}

	if (selection.isCollapsed && !e.shiftKey) {
		newAnchorOffset = newFocusOffset;
	}

	selection.setBaseAndExtent(
		selection.anchorNode,
		newAnchorOffset,
		selection.focusNode,
		newFocusOffset
	);
}
