import { IEdgesInfo, ISelection, ITextWidgetFacade } from 'types';
import isPlainTextFacade from '../plainTextActions/isPlainTextFacade';
import getEdgesInfo from './getEdgesInfo';
import getSibling from './getSibling';
import insertTextCrossWidget from './insertTextCrossWidget';
import removeWidget from './removeWidget';

export default function deleteContent(
	backward: boolean,
	target: ITextWidgetFacade,
	selection: ISelection
): void {
	const forward = !backward;
	const edgesInfo = getEdgesInfo(target, selection);

	if (edgesInfo.startChild === edgesInfo.endChild) {
		const startIndex = edgesInfo.startIndexRelativeToStartChild;
		const endIndex = edgesInfo.endIndexRelativeToEndChild;
		const isCollapsed = startIndex === endIndex;

		// Если курсор в начале PlainText - удаляем предыдущий виджет внутри
		// текстового виджета (если он есть)
		const noTextLeft = startIndex === 0 && backward;
		const noTextRight =
			endIndex === edgesInfo.startChild.text.length && forward;
		if (isCollapsed && (noTextLeft || noTextRight)) {
			deleteContentOnSibling(backward, target, edgesInfo);
		} else {
			edgesInfo.startChild.insertText(
				'',
				isCollapsed && backward ? Math.max(0, startIndex - 1) : startIndex,
				isCollapsed && forward ? endIndex + 1 : endIndex
			);
		}
	} else {
		const newChildren = insertTextCrossWidget(target, '', edgesInfo);
		target.children = newChildren;
	}
}

export function deleteContentOnSibling(
	backward: boolean,
	target: ITextWidgetFacade,
	edgesInfo: IEdgesInfo
): void {
	const forward = !backward;
	const siblingChild = getSibling(edgesInfo.startChild, target, forward);

	if (!siblingChild) {
		return;
	}

	// Сценарий когда два PlainText с разным форматированием стоят рядом
	if (isPlainTextFacade(siblingChild)) {
		if (backward) {
			// Удаляем последний символ левого элемента
			siblingChild.insertText(
				'',
				siblingChild.text.length - 1,
				siblingChild.text.length
			);
		} else {
			// Удаляем первый символ правого элемента
			siblingChild.insertText('', 0, 1);
		}
	} else {
		removeWidget(siblingChild, target);
	}
}
