import {
	ICaretPosition,
	ICaretPositions,
	ISelection,
	ITextWidgetFacade,
	SyntheticSelectionRects,
} from 'types';
import { default as isEmpty } from './isEmpty';
import {
	getCaretPosition,
	getInitialCaretPosition,
	setCaret,
	searchCaretPositionByOffset,
	searchCaretPositionByTextOffset,
	computeSyntheticSelectionRects,
} from './caret';
import isCollapsed from './isCollapsed';
import isForward from './isForward';

export default function applySelection(
	target: HTMLElement,
	textFacade: ITextWidgetFacade,
	selection: ISelection
): SyntheticSelectionRects {
	if (!selection) {
		return [];
	}

	if (selection.focusText === textFacade) {
		applyNativeSelection(target, textFacade, selection);
		return [];
	}

	return applySyntheticSelection(target, textFacade, selection);
}

function applySyntheticSelection(
	target: HTMLElement,
	textFacade: ITextWidgetFacade,
	selection: ISelection
): SyntheticSelectionRects {
	const initialStartCaretPosition = getInitialCaretPosition(
		target,
		'start',
		true
	);
	const initialEndCaretPosition = getInitialCaretPosition(target, 'end', true);

	if (selection.anchorText === textFacade) {
		const isForwardSelection = isForward(selection);

		const anchorCaretPosition = getCaretPosition(
			target,
			'start',
			searchCaretPositionByTextOffset,
			selection.anchorOffset,
			textFacade
		);

		const startCaretPosition = isForwardSelection
			? anchorCaretPosition
			: initialStartCaretPosition;
		const endCaretPosition = isForwardSelection
			? initialEndCaretPosition
			: anchorCaretPosition;

		return computeSyntheticSelectionRects(
			target,
			startCaretPosition,
			endCaretPosition
		);
	}

	return computeSyntheticSelectionRects(
		target,
		initialStartCaretPosition,
		initialEndCaretPosition
	);
}

function applyNativeSelection(
	target: HTMLElement,
	textFacade: ITextWidgetFacade,
	selection: ISelection
): void {
	let caretPositions: ICaretPositions;
	if (selection.focusDirection === 'left') {
		caretPositions = getCaretPositionsWhenLeftDirection(
			target,
			textFacade,
			selection
		);
	} else if (selection.focusDirection === 'right') {
		caretPositions = getCaretPositionsWhenRightDirection(
			target,
			textFacade,
			selection
		);
	} else if (typeof selection.offsetX === 'number') {
		caretPositions = getCaretPositionsByOffset(target, textFacade, selection);
	} else {
		caretPositions = getCaretPositionsByTextOffset(
			target,
			textFacade,
			selection
		);
	}

	setCaret(target, caretPositions);
}

function getCaretPositionsWhenLeftDirection(
	target: HTMLElement,
	textFacade: ITextWidgetFacade,
	selection: ISelection
): ICaretPositions {
	const endCaretPosition = getInitialCaretPosition(target, 'end');
	const isForwardSelection = isForward(selection);

	if (isForwardSelection) {
		if (selection.anchorText === selection.focusText) {
			return {
				anchor: getCaretPosition(
					target,
					'start',
					searchCaretPositionByTextOffset,
					selection.anchorOffset,
					textFacade
				),
				focus: endCaretPosition,
			};
		}

		return {
			anchor: getInitialCaretPosition(target, 'start'),
			focus: endCaretPosition,
		};
	}

	return {
		focus: endCaretPosition,
		anchor: endCaretPosition,
	};
}

function getCaretPositionsWhenRightDirection(
	target: HTMLElement,
	textFacade: ITextWidgetFacade,
	selection: ISelection
): ICaretPositions {
	const startCaretPosition = getInitialCaretPosition(target, 'start');
	const isBackwardSelection = !isForward(selection);

	if (isBackwardSelection) {
		if (selection.anchorText === selection.focusText) {
			return {
				anchor: getCaretPosition(
					target,
					'end',
					searchCaretPositionByTextOffset,
					selection.anchorOffset,
					textFacade
				),
				focus: startCaretPosition,
			};
		}

		return {
			anchor: getInitialCaretPosition(target, 'end'),
			focus: startCaretPosition,
		};
	}

	return {
		focus: startCaretPosition,
		anchor: startCaretPosition,
	};
}

function getCaretPositionsByOffset(
	target: HTMLElement,
	textFacade: ITextWidgetFacade,
	selection: ISelection
): ICaretPositions | never {
	if (typeof selection.offsetX !== 'number') {
		throw new Error("Can't compute caret positions. No offset in selection");
	}

	const startSearchFrom = isForward(selection) ? 'start' : 'end';

	const focus = getCaretPosition(
		target,
		startSearchFrom,
		searchCaretPositionByOffset,
		selection.offsetX
	);

	let anchor: ICaretPosition;
	if (selection.focusText === selection.anchorText) {
		if (typeof selection.anchorOffset === 'number') {
			anchor = getCaretPosition(
				target,
				startSearchFrom,
				searchCaretPositionByTextOffset,
				selection.anchorOffset,
				textFacade
			);
		} else {
			anchor = focus;
		}
	} else {
		anchor = getInitialCaretPosition(target, startSearchFrom);
	}

	return {
		focus,
		anchor,
	};
}

function getCaretPositionsByTextOffset(
	target: HTMLElement,
	textFacade: ITextWidgetFacade,
	selection: ISelection
): ICaretPositions {
	const startSearchFrom = isForward(selection) ? 'start' : 'end';

	const focus = getCaretPosition(
		target,
		startSearchFrom,
		searchCaretPositionByTextOffset,
		selection.focusOffset,
		textFacade
	);
	const anchor =
		selection.anchorText === selection.focusText
			? getCaretPosition(
					target,
					startSearchFrom,
					searchCaretPositionByTextOffset,
					selection.anchorOffset,
					textFacade
				)
			: getInitialCaretPosition(target, startSearchFrom);

	return {
		focus,
		anchor,
	};
}
