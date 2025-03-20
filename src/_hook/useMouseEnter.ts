import { EditorContext } from 'context';
import { useContext } from 'solid-js';
import { IDirection, ITextWidgetFacade } from 'types';
import { computeTextOffsetByOffsetX, isRightTextPathOf } from 'utils';

const PRIMARY_BUTTON_PRESSED = 1;

export default function useMouseEnter(value: ITextWidgetFacade) {
	const { frameFacade } = useContext(EditorContext);

	const onMouseEnter = (e: MouseEvent) => {
		const anchorPoint = frameFacade.anchorPoint;

		if (e.buttons === PRIMARY_BUTTON_PRESSED && anchorPoint) {
			const anchorText = anchorPoint.anchorText;
			const focusText = value;
			const isFocusToRightThanAnchor = isRightTextPathOf(
				focusText.path,
				anchorText.path
			);
			const direction = isFocusToRightThanAnchor ? 'down' : 'up';

			const focusOffset = computeTextOffsetByOffsetX(
				value,
				e.pageX,
				direction
			);

			if (typeof focusOffset === 'number') {
				frameFacade._mouseEnterText(value, focusOffset, direction);
			}
		}
	};

	return onMouseEnter;
}
