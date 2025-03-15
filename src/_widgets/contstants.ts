import { PlainTextFacade } from 'entities';
import { IWidgetFacadeMap, PLAIN_TEXT_FACADE_TYPE, WIDGETS } from 'types';
import BlockquoteFacade from './BlockquoteFacade';
import EmojiFacade from './EmojiFacade';
import TextFacade from './TextFacade';

export const widgetFacadeMap: IWidgetFacadeMap = {
	[WIDGETS.emoji]: EmojiFacade,
	[WIDGETS.blockquote]: BlockquoteFacade,
	[WIDGETS.text]: TextFacade,
	[PLAIN_TEXT_FACADE_TYPE]: PlainTextFacade,
};
