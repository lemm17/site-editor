import {
	IEdgesInfo,
	IPlainTextFacade,
	ISelection,
	ITextWidgetFacade,
} from 'types';
import isPlainTextFacade from '../plainTextActions/isPlainTextFacade';

export default function getEdgesInfo(
	target: ITextWidgetFacade,
	selection: ISelection
): IEdgesInfo {
	const startIndex = Math.min(selection.anchor, selection.focus);
	const endIndex = Math.max(selection.anchor, selection.focus);

	let startChild: IPlainTextFacade = null;
	let startChildIndexInParent: number = null;
	let startIndexRelativeToStartChild: number = null;
	let endChild: IPlainTextFacade = null;
	let endChildIndexInParent: number = null;
	let endIndexRelativeToEndChild: number = null;
	let completedDistance = 0;
	for (const [index, child] of target.children.entries()) {
		if (startChild && endChild) {
			break;
		}

		if (!isPlainTextFacade(child)) {
			completedDistance++;
			continue;
		}

		if (
			!startChild &&
			completedDistance <= startIndex &&
			startIndex <= completedDistance + child.text.length
		) {
			startChild = child;
			startIndexRelativeToStartChild = startIndex - completedDistance;
			startChildIndexInParent = index;
		}

		if (
			!endChild &&
			completedDistance <= endIndex &&
			endIndex <= completedDistance + child.text.length
		) {
			endChild = child;
			endIndexRelativeToEndChild = endIndex - completedDistance;
			endChildIndexInParent = index;
		}

		completedDistance += child.text.length;
	}

	if (!startChild) {
		throw new Error(
			`Didn\'t find start child by index ${startIndex} in textFacade by id ${target.id}`
		);
	}

	if (!endChild) {
		throw new Error(
			`Didn\'t find end child by index ${endIndex} in textFacade by id ${target.id}`
		);
	}

	return {
		startChild,
		startChildIndexInParent,
		startIndexRelativeToStartChild,
		endChild,
		endChildIndexInParent,
		endIndexRelativeToEndChild,
	};
}
