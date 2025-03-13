import { IBaseFacade, IEdgesInfo, ITextWidgetFacade } from 'types';
import correctChildIndexes from './correctChildIndexes';

export default function (
	target: ITextWidgetFacade,
	text: string,
	edgesInfo: IEdgesInfo
): IBaseFacade[] {
	const {
		startChild,
		endChild,
		startChildIndexInParent,
		endChildIndexInParent,
		startIndexRelativeToStartChild,
		endIndexRelativeToEndChild,
	} = edgesInfo;
	const leftChildren = target.children.slice(0, startChildIndexInParent);
	const rightChildren = target.children.slice(endChildIndexInParent + 1);

	const middleLeftChild = startChild;
	middleLeftChild.insertText(
		text,
		startIndexRelativeToStartChild,
		middleLeftChild.text.length
	);
	const middleRightChild = endChild;
	middleRightChild.insertText('', 0, endIndexRelativeToEndChild);

	const leftPart = [...leftChildren, middleLeftChild];
	const rightPart = [middleRightChild, ...rightChildren];

	const startOfNewIndex = leftPart.length;
	correctChildIndexes(rightPart, startOfNewIndex);

	const newChildren = [...leftPart, ...rightPart];

	return newChildren;
}
