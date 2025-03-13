import {
	IBaseFacade,
	IFrameFacade,
	IWidget,
	IWidgetFacade,
	Position,
} from 'types';
import correctChildIndexes from './correctChildIndexes';
import getWFByPath from './getWFByPath';
import cloneSmartPathOfTargetAndIncrementIfNeed from './incrementSmartPath';
import splitChildrenByPosition from './splitChildrenByPosition';

export default function addWidget(
	frameFacade: IFrameFacade,
	target: IBaseFacade,
	position: Position,
	sample: IWidget
): void {
	const smartPathForNewElement = cloneSmartPathOfTargetAndIncrementIfNeed(
		target as IWidgetFacade,
		position === 'after'
	);

	const parentPath = target.path.slice(0, -1);
	const parent = getWFByPath(frameFacade, parentPath);
	const newWidget = frameFacade.widgetFacadeConstructor(
		sample,
		smartPathForNewElement,
		parent.toFrame()
	) as IWidgetFacade;

	const [leftPart, rightPart] = splitChildrenByPosition(
		frameFacade,
		target as IWidgetFacade,
		position
	);

	const newChildren = [...leftPart, newWidget, ...rightPart];
	correctChildIndexes(rightPart, leftPart.length + 1);

	parent.children = newChildren;
}
