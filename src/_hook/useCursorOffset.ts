import { EditorContext } from 'context';
import { useContext } from 'solid-js';
import { computeOffset as computeOffsetInner } from 'utils';

type OffsetComputer = () => number;
type OffsetResetter = Function;

export default function useCursorOffset(): [OffsetComputer, OffsetResetter] {
	const editorContext = useContext(EditorContext);

	const computeOffset: OffsetComputer = () => {
		const offset = editorContext.cursorOffset ?? computeOffsetInner();
		editorContext.cursorOffset = offset;

		return offset;
	};

	const resetOffset: OffsetResetter = () => {
		editorContext.cursorOffset = null;
	};

	return [computeOffset, resetOffset];
}
