import { ISelection } from 'types';

export default function (selection: ISelection): boolean {
	return (
		selection.anchorOffset === selection.focusOffset &&
		selection.anchorText === selection.focusText
	);
}
