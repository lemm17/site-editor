import { Editor } from 'components';
import { IFrame, WIDGETS } from 'types';
import { widgetComponentMap } from 'components';
import { widgetFacadeMap } from 'widgets';
import './App.css';
import { FrameFacade } from 'entities';
import { highlightJSON } from 'utils';
import { onMount } from 'solid-js';

const EMOJI = '☢️';
const mockedValue: IFrame = [
	'frame',
	{},
	[WIDGETS.text, 'Hello'],
	[
		WIDGETS.blockquote,
		[WIDGETS.text, '', [WIDGETS.emoji, { value: EMOJI }], 'hello'],
		[WIDGETS.text, 'world!', [WIDGETS.emoji, { value: EMOJI }], ''],
	],
	[WIDGETS.text, 'World!'],
];

let preRef: HTMLPreElement;
const onAction = () => {
	preRef.innerHTML = highlightJSON(
		JSON.stringify(frameFacade.toFrame(), null, 4)
	);
};
const frameFacade = new FrameFacade(mockedValue, widgetFacadeMap, () =>
	requestIdleCallback(() => onAction())
);
window['$f'] = frameFacade;

function App() {
	onMount(() => {
		onAction();
	});

	return (
		<div class='demo'>
			<Editor frameFacade={frameFacade} componentMap={widgetComponentMap} />
			<pre ref={preRef}></pre>
		</div>
	);
}

export default App;
