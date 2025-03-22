import { ISelection } from 'types';

export default function isEqual(
	selectionA: ISelection,
	selectionB: ISelection
): boolean {
	return (
		selectionA.anchorOffset === selectionB.anchorOffset &&
		selectionA.anchorText === selectionB.anchorText &&
		selectionA.focusOffset === selectionB.focusOffset &&
		selectionA.focusText === selectionB.focusText
	);
}
