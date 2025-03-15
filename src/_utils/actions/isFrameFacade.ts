import { IBaseFacade, IFacade, IFrameFacade } from 'types';

export default function isFrameFacade(
	candidate: IFacade<IBaseFacade>
): candidate is IFrameFacade {
	return (candidate as IFrameFacade).isFrameFacade;
}
