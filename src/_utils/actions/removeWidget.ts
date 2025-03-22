import { IBaseFacade, IWidgetFacade } from 'types';
import correctSmartIndexes from './correctSmartIndexes';
import getParent from './getParent';
import { splitChildrenByTarget } from './split';

export default function removeWidget(
	target: IBaseFacade,
	parent?: IWidgetFacade
): void {
	const computedParent = parent ?? getParent(target);

	if (computedParent.children.includes(target)) {
		const newChildren = getParentChildrenWithoutTargetAndCorrectIndexes(
			target,
			computedParent
		);

		computedParent.children = newChildren;
	}
}

export function getParentChildrenWithoutTargetAndCorrectIndexes(
	target: IBaseFacade,
	parent?: IWidgetFacade
): IBaseFacade[] {
	const computedParent = parent ?? getParent(target);
	const [leftPart, rightPart] = splitChildrenByTarget(
		computedParent.children,
		target
	);
	correctSmartIndexes(rightPart, leftPart.length);
	const newChildren = [...leftPart, ...rightPart];

	return newChildren;
}
