import { IFrameFacade, ISelection, IWidgetFacade } from 'types';
import isFrameFacade from '../actions/isFrameFacade';
import { default as CFDFSTraverse } from '../CFDFSTraverse';

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

	const direction = ['down', 'right', 'end'].includes(selection.direction)
		? 'right'
		: 'left';
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
