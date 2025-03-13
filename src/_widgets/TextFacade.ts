import { WidgetFacade, createAction } from 'entities';
import {
	IWidget,
	WIDGETS,
	IEmojiProps,
	ITextWidgetFacade,
	ACTION,
	IInputActionData,
	ITextProps,
} from 'types';
import { DEFAULT_EMOJI } from './EmojiFacade';

export default class TextFacade
	extends WidgetFacade
	implements ITextWidgetFacade
{
	readonly type: WIDGETS.text;

	input(data: IInputActionData): void {
		const insertTextAction = createAction(ACTION.INPUT, {
			initiator: this,
			target: this,
			data: data,
		});

		this._notify(insertTextAction);
	}

	static sample: IWidget<ITextProps> = [
		WIDGETS.text,
		{ value: DEFAULT_EMOJI },
	];
}
