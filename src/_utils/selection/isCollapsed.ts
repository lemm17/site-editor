import { ISelection } from 'types';

export default function (selection: ISelection): boolean {
	return selection.anchor === selection.focus;
}
