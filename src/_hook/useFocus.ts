import { EditorContext } from 'context';
import { useContext, createSignal, Accessor } from 'solid-js';
import { FocusCallback, IWidgetFacade, SyntheticSelectionRects } from 'types';

const DEFAULT_RECTS: SyntheticSelectionRects = [];

export default function useFocus(
	value: IWidgetFacade,
	focusCallback: FocusCallback
): Accessor<SyntheticSelectionRects> {
	const { frameFacade } = useContext(EditorContext);
	const [rects, setRects] = createSignal(DEFAULT_RECTS);

	frameFacade._subscribeFocus(value, (selection) => {
		if (!selection) {
			setRects(DEFAULT_RECTS);
		}
		const newRects = focusCallback(selection);
		if (newRects) {
			setRects(newRects);
		}

		return newRects;
	});
	return rects;
}
