import { EditorContext } from 'context';
import { useContext } from 'solid-js';
import { FocusCallback, IWidgetFacade } from 'types';

export default function useFocus(
	value: IWidgetFacade,
	focusCallback: FocusCallback
): void {
	const { frameFacade } = useContext(EditorContext);

	frameFacade.subscribeFocus(value, focusCallback);
}
