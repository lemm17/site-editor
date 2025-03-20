import {
	ICaretPosition,
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

	const initialStartCaretPosition = getInitialCaretPosition(
		target,
		'start',
		true
	);
	const initialEndCaretPosition = getInitialCaretPosition(target, 'end', true);

	if (selection.anchorText === textFacade) {
		const isUpDirection =
			selection.direction === 'up' || selection.direction === 'left';

		const anchorCaretPosition = getCaretPosition(
			target,
			'start',
			searchCaretPositionByTextOffset,
			selection.anchorOffset,
			textFacade
		);

		const startCaretPosition = isUpDirection
			? initialStartCaretPosition
			: anchorCaretPosition;
		const endCaretPosition = isUpDirection
			? anchorCaretPosition
			: initialEndCaretPosition;

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
	const fromRight = selection.direction === 'left';
	const fromLeft = selection.direction === 'right';

	let focusCaretPosition: ICaretPosition;
	let anchorCaretPosition: ICaretPosition;
	if (fromLeft || isEmpty(target)) {
		focusCaretPosition = getInitialCaretPosition(target, 'start');
		anchorCaretPosition = focusCaretPosition;
	} else if (fromRight) {
		focusCaretPosition = getInitialCaretPosition(target, 'end');
		anchorCaretPosition = focusCaretPosition;
	} else {
		const startSearchFrom = selection.direction === 'up' ? 'end' : 'start';
		if (isCollapsed(selection) && typeof selection.offset === 'number') {
			focusCaretPosition = getCaretPosition(
				target,
				startSearchFrom,
				searchCaretPositionByOffset,
				selection.offset
			);
			anchorCaretPosition = focusCaretPosition;
		} else {
			focusCaretPosition = getCaretPosition(
				target,
				startSearchFrom,
				searchCaretPositionByTextOffset,
				selection.focusOffset,
				textFacade
			);

			if (selection.anchorText === selection.focusText) {
				anchorCaretPosition = getCaretPosition(
					target,
					startSearchFrom,
					searchCaretPositionByTextOffset,
					selection.anchorOffset,
					textFacade
				);
			} else {
				anchorCaretPosition = getInitialCaretPosition(
					target,
					startSearchFrom
				);
			}
		}
	}

	setCaret(target, anchorCaretPosition, focusCaretPosition);
}
