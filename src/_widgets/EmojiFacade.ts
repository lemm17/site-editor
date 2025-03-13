import { WidgetFacade } from 'entities';
import { IWidget, IEmojiProps, WIDGETS } from 'types';

export const DEFAULT_EMOJI = '☢️';

export default class EmojiFacade extends WidgetFacade {
	readonly isInline: boolean = true;

	static sample: IWidget<IEmojiProps> = [
		WIDGETS.emoji,
		{ value: DEFAULT_EMOJI },
	];
}
