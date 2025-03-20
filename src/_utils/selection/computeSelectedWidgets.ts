import { IFrameFacade, ISelection, IWidgetFacade } from 'types';
import isFrameFacade from '../actions/isFrameFacade';
import { default as CFDFSTraverse } from '../CFDFSTraverse';

export default function computeSelectedWidgets(
	selection: ISelection,
	frameFacade: IFrameFacade
): IWidgetFacade[] {
	if (selection.anchorText === selection.focusText) {
		return [selection.anchorText];
	}

	const direction = ['down', 'right', 'end'].includes(selection.direction)
		? 'right'
		: 'left';
	const selectedWidgets: IWidgetFacade[] = [selection.anchorText];
	const anchorPathAsString = selection.anchorText.path.join('');

	CFDFSTraverse(selection.anchorText, frameFacade, direction, (regular) => {
		const currentPathAsString = regular.path.join('');
		const isAnchorAncestor =
			anchorPathAsString.startsWith(currentPathAsString);

		if (!isAnchorAncestor && !isFrameFacade(regular) && !regular.isInline) {
			selectedWidgets.push(regular as IWidgetFacade);
		}

		if (regular === selection.focusText) {
			return true;
		}
	});

	return selectedWidgets;
}
