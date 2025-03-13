import { Editor } from 'components';
import { IFrame, WIDGETS } from 'types';
import { widgetComponentMap } from 'components';
import { widgetFacadeMap } from 'widgets';
import './App.css';
import { FrameFacade } from 'entities';

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

const frameFacade = new FrameFacade(mockedValue, widgetFacadeMap);
window['$f'] = frameFacade;

function App() {
	return (
		<Editor frameFacade={frameFacade} componentMap={widgetComponentMap} />
	);
}

export default App;
