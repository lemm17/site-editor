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
	const [leftPart, rightPart] = splitChildrenByTarget(parent.children, target);
	correctSmartIndexes(rightPart, target.path.at(-1));
	const newChildren = [...leftPart, ...rightPart];

	parent.children = newChildren;
}
