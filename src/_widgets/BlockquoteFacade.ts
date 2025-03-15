import { TextWrapperFacade } from 'entities';
import { IEmojiProps, IWidget, WIDGETS } from 'types';

export default class BlockquoteFacade extends TextWrapperFacade {
	static sample: IWidget<IEmojiProps> = [
		WIDGETS.blockquote,
		[WIDGETS.text, ''],
	];
}
