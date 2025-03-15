import { IBaseFacade, IFacade, ITextWidgetFacade, WIDGETS } from 'types';

export default function isTextFacade(
	facade: IFacade<IBaseFacade>
): facade is ITextWidgetFacade {
	return 'type' in facade && facade.type === WIDGETS.text;
}
