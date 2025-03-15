import { IBaseFacade, IFrameFacade, IWidgetFacade } from 'types';
import getWFByPath from './getWFByPath';

export default function getParent(
	target: IBaseFacade,
	frameFacade: IFrameFacade
): IWidgetFacade {
	const parentPath = target.path.slice(0, -1);
	return getWFByPath(frameFacade, parentPath);
}
