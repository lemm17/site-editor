import { IWidgetComponentProps } from 'types';
import { children } from 'solid-js';
import './Blockquote.css';

export interface IBlockquoteProps {}

export default function Blockquote(
	props: IWidgetComponentProps<IBlockquoteProps>
) {
	const resolvedChildren = children(() => props.children);

	return (
		<blockquote>
			<div class='blockquote-padding'>{resolvedChildren()}</div>
		</blockquote>
	);
}
