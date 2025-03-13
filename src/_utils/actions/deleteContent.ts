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

		edgesInfo.startChild.insertText(
			'',
			isCollapsed && backward ? startIndex - 1 : startIndex,
			isCollapsed && !backward ? endIndex + 1 : endIndex
		);
	} else {
		const newChildren = insertTextCrossWidget(target, '', edgesInfo);
		target.children = newChildren;
	}
}
