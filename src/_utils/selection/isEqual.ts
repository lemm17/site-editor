import { ISelection } from 'types';

export default function isEqual(
	selectionA: ISelection,
	selectionB: ISelection
): boolean {
	return (
		selectionA.anchor === selectionB.anchor &&
		selectionA.focus === selectionB.focus
	);
}
