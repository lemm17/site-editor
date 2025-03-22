import { ISelectionInfo, ISelection } from 'types';
import isPlainTextFacade from '../plainTextActions/isPlainTextFacade';
import getSelectionInfo from './getEdgesInfo';
import getSibling from './getSibling';
import insertTextCrossWidget from './insertTextCrossWidget';
import removeWidget from './removeWidget';

export default function deleteContent(
	selection: ISelection,
	forward: boolean
): void {
	const backward = !forward;
	const edgesInfo = getSelectionInfo(selection);

	if (edgesInfo.start.plainText === edgesInfo.end.plainText) {
		const startIndex = edgesInfo.start.plainTextOffset;
		const endIndex = edgesInfo.end.plainTextOffset;
		const isCollapsed = startIndex === endIndex;

		// Если курсор в начале PlainText - удаляем предыдущий виджет внутри
		// текстового виджета (если он есть)
		const noTextLeft = startIndex === 0 && backward;
		const noTextRight =
			endIndex === edgesInfo.start.plainText.text.length && forward;
		if (isCollapsed && (noTextLeft || noTextRight)) {
			deleteContentOnSibling(backward, edgesInfo);
		} else {
			edgesInfo.start.plainText.insertText(
				'',
				isCollapsed && backward ? Math.max(0, startIndex - 1) : startIndex,
				isCollapsed && forward ? endIndex + 1 : endIndex
			);
		}
	} else {
		insertTextCrossWidget('', edgesInfo);
	}
}

export function deleteContentOnSibling(
	backward: boolean,
	edgesInfo: ISelectionInfo
): void {
	const forward = !backward;
	const siblingChild = getSibling(edgesInfo.start.plainText, forward);

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
		removeWidget(siblingChild);
	}
}
