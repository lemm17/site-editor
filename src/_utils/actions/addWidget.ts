import {
	IBaseFacade,
	IFrameFacade,
	IWidget,
	IWidgetFacade,
	Position,
} from 'types';
import correctSmartIndexes from './correctSmartIndexes';
import getWFByPath from './getWFByPath';
import cloneSmartPathOfTargetAndIncrementIfNeed from './incrementSmartPath';
import { splitChildrenByTarget } from './split';

export default function addWidget(
	frameFacade: IFrameFacade,
	target: IBaseFacade,
	position: Position,
	sample: IWidget
): void {
	const parentPath = target.path.slice(0, -1);
	const parent = getWFByPath(frameFacade, parentPath);

	const smartPathForNewElement = cloneSmartPathOfTargetAndIncrementIfNeed(
		target as IWidgetFacade,
		position === 'after'
	);
	const newWidget = frameFacade.widgetFacadeConstructor(
		sample,
		smartPathForNewElement,
		parent.toFrame()
	) as IWidgetFacade;

	const [leftPart, rightPart] = splitChildrenByTarget(
		parent.children,
		target as IWidgetFacade,
		position
	);

	const newChildren = [...leftPart, newWidget, ...rightPart];
	correctSmartIndexes(rightPart, leftPart.length + 1);

	parent.children = newChildren;
}
