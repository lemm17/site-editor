import { IWidgetFacadeConstructor, WIDGETS } from 'types';
import BlockquoteFacade from './BlockquoteFacade';
import EmojiFacade from './EmojiFacade';
import TextFacade from './TextFacade';

export const widgetFacadeMap: Record<WIDGETS, IWidgetFacadeConstructor> = {
	[WIDGETS.emoji]: EmojiFacade,
	[WIDGETS.blockquote]: BlockquoteFacade,
	[WIDGETS.text]: TextFacade,
};
