import { IWidgetComponent, WIDGETS } from 'types';
import { default as Emoji } from './Emoji';
import { default as Blockquote } from './Blockquote';
import { default as Text } from './Text';

export const widgetComponentMap = {
	[WIDGETS.text]: Text,
	[WIDGETS.emoji]: Emoji,
	[WIDGETS.blockquote]: Blockquote,
} as Record<WIDGETS, IWidgetComponent>;
