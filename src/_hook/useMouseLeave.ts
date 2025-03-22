import { EditorContext } from 'context';
import { useContext } from 'solid-js';
import { ITextWidgetFacade } from 'types';
import { computeAnchorOffset, facadeContainsSelection } from 'utils';

const PRIMARY_BUTTON_PRESSED = 1;

export default function useMouseLeave(value: ITextWidgetFacade) {
	const { frameFacade } = useContext(EditorContext);

	const onMouseLeave = (e: MouseEvent) => {
		if (
			e.buttons === PRIMARY_BUTTON_PRESSED &&
			facadeContainsSelection(value)
		) {
			const anchorOffset = computeAnchorOffset(value);

			if (typeof anchorOffset === 'number') {
				frameFacade._mouseLeaveText(value, anchorOffset);
			}
		}
	};

	return onMouseLeave;
}
