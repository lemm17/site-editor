import { WidgetFacade } from 'entities';
import { IEmojiProps, IWidget, WIDGETS } from 'types';
import { DEFAULT_EMOJI } from './EmojiFacade';

// TODO: Написать удаление виджета когда пустые дети
// TODO: Написать удаление цитаты когда удаляем по backspace, но выше нет виджета
export default class BlockquoteFacade extends WidgetFacade {
	static sample: IWidget<IEmojiProps> = [
		WIDGETS.emoji,
		{ value: DEFAULT_EMOJI },
	];
}
