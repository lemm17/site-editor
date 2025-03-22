import { IFrameFacade, ISelection, IWidgetFacade } from 'types';
import isFrameFacade from '../actions/isFrameFacade';
import { default as CFDFSTraverse } from '../CFDFSTraverse';
import isForward from './isForward';

export default function computeSelectedWidgets(
	selection: ISelection,
	include: { focus: boolean; anchor: boolean } = { focus: true, anchor: true }
): IWidgetFacade[] {
	const selectedWidgets: IWidgetFacade[] = include.anchor
		? [selection.anchorText]
		: [];

	if (selection.anchorText === selection.focusText) {
		if (include.focus) {
			return [...selectedWidgets, selection.focusText];
		}

		return selectedWidgets;
	}

	const direction = isForward(selection) ? 'right' : 'left';
	const anchorPathAsString = selection.anchorText.path.join('');

	CFDFSTraverse(selection.anchorText, direction, (regular) => {
		const currentPathAsString = regular.path.join('');
		const isAnchorAncestor =
			anchorPathAsString.startsWith(currentPathAsString);

		if (!isAnchorAncestor && !isFrameFacade(regular) && !regular.isInline) {
			const isFocus = selection.focusText === regular;
			if (!isFocus || include.focus) {
				selectedWidgets.push(regular as IWidgetFacade);
			}
		}

		if (regular === selection.focusText) {
			return true;
		}
	});

	return selectedWidgets;
}
