import { ISelection } from 'types';
import getSelectionInfo from './getEdgesInfo';
import insertTextCrossWidget from './insertTextCrossWidget';

export default function insertText(text: string, selection: ISelection): void {
	const selectionInfo = getSelectionInfo(selection);

	if (selectionInfo.start.plainText === selectionInfo.end.plainText) {
		selectionInfo.start.plainText.insertText(
			text,
			selectionInfo.start.plainTextOffset,
			selectionInfo.end.plainTextOffset
		);
	} else {
		insertTextCrossWidget(text, selectionInfo);
	}
}
