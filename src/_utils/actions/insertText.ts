import { ISelection, ITextWidgetFacade } from 'types';
import getEdgesInfo from './getEdgesInfo';
import insertTextCrossWidget from './insertTextCrossWidget';

export default function insertText(
	target: ITextWidgetFacade,
	selection: ISelection,
	text: string
): void {
	const edgesInfo = getEdgesInfo(target, selection);

	if (edgesInfo.startChild === edgesInfo.endChild) {
		edgesInfo.startChild.insertText(
			text,
			edgesInfo.startIndexRelativeToStartChild,
			edgesInfo.endIndexRelativeToEndChild
		);
	} else {
		const newChildren = insertTextCrossWidget(target, text, edgesInfo);
		target.children = newChildren;
	}
}
