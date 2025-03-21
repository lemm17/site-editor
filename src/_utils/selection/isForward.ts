import { ISelection } from 'types';

export default function isForward(selection: ISelection): boolean {
	return (
		selection.direction === 'right' ||
		selection.direction === 'down' ||
		selection.direction === 'end'
	);
}
