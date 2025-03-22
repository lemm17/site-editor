import { ISelection } from 'types';
import isRightTextPathOf from '../isRightTextPathOf';

export default function isForward(selection: ISelection): boolean {
	if (selection.focusText === selection.anchorText) {
		return selection.anchorOffset < selection.focusOffset;
	}

	return isRightTextPathOf(
		selection.focusText.path,
		selection.anchorText.path
	);
}
