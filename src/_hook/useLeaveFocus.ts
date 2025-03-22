import { EditorContext } from 'context';
import { useContext } from 'solid-js';
import { ISelection, IWidgetFacade } from 'types';

export default function useLeaveFocus(value: IWidgetFacade) {
	const { frameFacade } = useContext(EditorContext);

	return (selection: ISelection, shift: boolean) =>
		frameFacade._leaveFocus(value, selection, shift);
}
