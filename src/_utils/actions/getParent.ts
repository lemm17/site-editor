import { IBaseFacade, IWidgetFacade } from 'types';
import getWFByPath from './getWFByPath';

export default function getParent(target: IBaseFacade): IWidgetFacade {
	const parentPath = target.path.slice(0, -1);
	return getWFByPath(target.frameFacade, parentPath);
}
