import { ISelection, ITextWidgetFacade } from 'types';
import getEdgesInfo from './getEdgesInfo';
import insertTextCrossWidget from './insertTextCrossWidget';

export default function deleteContent(
	backward: boolean,
	target: ITextWidgetFacade,
	selection: ISelection
): void {
	const edgesInfo = getEdgesInfo(target, selection);

	if (edgesInfo.startChild === edgesInfo.endChild) {
		const startIndex = edgesInfo.startIndexRelativeToStartChild;
		const endIndex = edgesInfo.endIndexRelativeToEndChild;
		const isCollapsed = startIndex === endIndex;
		const modifier: -1 | 1 = backward ? -1 : 1;

		edgesInfo.startChild.insertText(
			'',
			isCollapsed ? startIndex + modifier : startIndex,
			edgesInfo.endIndexRelativeToEndChild
		);
	} else {
		const newChildren = insertTextCrossWidget(target, '', edgesInfo);
		target.children = newChildren;
	}
}
