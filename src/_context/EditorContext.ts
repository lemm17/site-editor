import { createContext } from 'solid-js';
import { IFrameFacade } from 'types';

interface IEditorContext {
	frameFacade: IFrameFacade;
	cursorOffset: number | null;
}

export default createContext<IEditorContext>();
