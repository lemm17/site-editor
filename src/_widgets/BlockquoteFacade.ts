import { WidgetFacade } from 'entities';
import { IEmojiProps, IWidget, WIDGETS } from 'types';
import { DEFAULT_EMOJI } from './EmojiFacade';

export default class BlockquoteFacade extends WidgetFacade {
	static sample: IWidget<IEmojiProps> = [
		WIDGETS.emoji,
		{ value: DEFAULT_EMOJI },
	];
}
