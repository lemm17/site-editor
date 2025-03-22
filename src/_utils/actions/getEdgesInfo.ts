import {
	IEdgeInfo,
	ISelectionInfo,
	ISelection,
	ITextWidgetFacade,
} from 'types';
import isPlainTextFacade from '../plainTextActions/isPlainTextFacade';
import isForward from '../selection/isForward';
import computeSelectedWidgets from '../selection/computeSelectedWidgets';

export default function getSelectionInfo(
	selection: ISelection
): ISelectionInfo {
	const isForwardSelection = isForward(selection);

	const startText = isForwardSelection
		? selection.anchorText
		: selection.focusText;
	const startOffset = isForwardSelection
		? selection.anchorOffset
		: selection.focusOffset;
	const start = getEdgeInfo(startText, startOffset);

	if (!start.plainText) {
		throw new Error(
			`Didn\'t find start child by index ${startOffset} in textFacade by id ${startText}`
		);
	}

	const endText = isForwardSelection
		? selection.focusText
		: selection.anchorText;
	const endOffset = isForwardSelection
		? selection.focusOffset
		: selection.anchorOffset;
	const end = getEdgeInfo(endText, endOffset);

	if (!end.plainText) {
		throw new Error(
			`Didn\'t find end child by index ${endOffset} in textFacade by id ${endText}`
		);
	}

	return {
		start,
		middle: computeSelectedWidgets(selection, {
			focus: false,
			anchor: false,
		}),
		end,
	};
}

function getEdgeInfo(
	textEdge: ITextWidgetFacade,
	textOffset: number
): IEdgeInfo {
	let completedDistance = 0;
	for (const [index, child] of textEdge.children.entries()) {
		if (!isPlainTextFacade(child)) {
			completedDistance++;
			continue;
		}

		if (
			completedDistance <= textOffset &&
			textOffset <= completedDistance + child.text.length
		) {
			return {
				plainText: child,
				text: textEdge,
				plainTextOffset: textOffset - completedDistance,
				plainTextIndexInParent: index,
			};
		}

		completedDistance += child.text.length;
	}
}
