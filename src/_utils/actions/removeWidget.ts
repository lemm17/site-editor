import { IBaseFacade, IFrameFacade, IWidgetFacade } from 'types';
import correctSmartIndexes from './correctSmartIndexes';
import getParent from './getParent';
import isFrameFacade from './isFrameFacade';
import { splitChildrenByTarget } from './split';

export default function removeWidget(
	target: IBaseFacade,
	frameFacade: IFrameFacade
): void;
export default function removeWidget(
	target: IBaseFacade,
	parent: IWidgetFacade
): void;
export default function removeWidget(
	target: IBaseFacade,
	frameFacadeOrParent: IFrameFacade | IWidgetFacade
): void {
	const parent = isFrameFacade(frameFacadeOrParent)
		? getParent(target, frameFacadeOrParent)
		: frameFacadeOrParent;
	const newChildren = getParentChildrenWithoutTargetAndCorrectIndexes(
		target,
		parent
	);

	parent.children = newChildren;
}

export function getParentChildrenWithoutTargetAndCorrectIndexes(
	target: IBaseFacade,
	frameFacade: IFrameFacade
): IBaseFacade[];
export function getParentChildrenWithoutTargetAndCorrectIndexes(
	target: IBaseFacade,
	parent: IWidgetFacade
): IBaseFacade[];
export function getParentChildrenWithoutTargetAndCorrectIndexes(
	target: IBaseFacade,
	frameFacadeOrParent: IFrameFacade | IWidgetFacade
): IBaseFacade[] {
	const parent = isFrameFacade(frameFacadeOrParent)
		? getParent(target, frameFacadeOrParent)
		: frameFacadeOrParent;
	const [leftPart, rightPart] = splitChildrenByTarget(parent.children, target);
	correctSmartIndexes(rightPart, leftPart.length);
	const newChildren = [...leftPart, ...rightPart];

	return newChildren;
}
