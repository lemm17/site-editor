import { IBaseFacade, IFrameFacade, IWidgetFacade, Position } from 'types';
import getWFByPath from './getWFByPath';

export default function (
	frame: IFrameFacade,
	target: IWidgetFacade,
	position: Position
): [IBaseFacade[], IBaseFacade[]] {
	const targetIndexInParent = target.path.at(-1);
	const parentPath = target.path.slice(0, -1);
	const parent = getWFByPath(frame, parentPath);

	const rightPart =
		position === 'before'
			? parent.children.slice(targetIndexInParent)
			: parent.children.slice(targetIndexInParent + 1);
	const leftPart =
		position === 'before'
			? parent.children.slice(0, targetIndexInParent)
			: parent.children.slice(0, targetIndexInParent + 1);

	return [leftPart, rightPart];
}
