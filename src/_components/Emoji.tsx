import { IWidgetComponentProps, IEmojiProps, WIDGETS } from 'types';

export default function Emoji({ value }: IWidgetComponentProps<IEmojiProps>) {
	const { value: emoji } = value.properties;

	return (
		<span
			onClick={() => value.add({ widget: WIDGETS.emoji, position: 'after' })}
		>
			{emoji}
		</span>
	);
}
