import { IBaseFacade, IEdgesInfo, ITextWidgetFacade } from 'types';
import { splitChildrenByCrossWidgetSelection } from './split';

export default function (
	target: ITextWidgetFacade,
	text: string,
	edgesInfo: IEdgesInfo
): IBaseFacade[] {
	const { startIndexRelativeToStartChild, endIndexRelativeToEndChild } =
		edgesInfo;

	const [leftChildren, middleLeftChild, middleRightChild, rightChildren] =
		splitChildrenByCrossWidgetSelection(target, edgesInfo);

	middleLeftChild.insertText(
		text,
		startIndexRelativeToStartChild,
		middleLeftChild.text.length
	);
	middleRightChild.insertText('', 0, endIndexRelativeToEndChild);

	const leftPart = [...leftChildren, middleLeftChild];
	const rightPart = [middleRightChild, ...rightChildren];

	return [...leftPart, ...rightPart];
}
