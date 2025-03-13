import {
	CFDFSTraverse,
	constructFrameFacade,
	createBubbleEventFunc,
	createWidgetFacadeConstructor,
	toFrame,
	deleteContent,
	insertText,
	addWidget,
} from 'utils';
import {
	IFrame,
	BubbleEventFunc,
	IWidgetFacade,
	WIDGETS,
	IWidgetFacadeConstructor,
	IFrameFacade,
	ACTION,
	IAction,
	Path,
	IAddAction,
	SmartPath,
	WidgetFacadeConstructor,
	FocusCallback,
	ISelection,
	IInputAction,
	IInsertTextActionData,
	IInsertParagraphActionData,
	IDeleteContentBackwardActionData,
	IDeleteContentForwardActionData,
} from 'types';
import { AddAction, InputAction } from './Action';

export default class FrameFacade implements IFrameFacade {
	readonly children: IWidgetFacade[];
	readonly widgetFacadeConstructor: WidgetFacadeConstructor;

	get path(): Path {
		return [];
	}
	get smartPath(): SmartPath {
		return [];
	}

	private readonly _bubbleEvent: BubbleEventFunc;
	private readonly _facadeMap: Record<WIDGETS, IWidgetFacadeConstructor>;
	private readonly _focusCallbackMap: WeakMap<IWidgetFacade, FocusCallback> =
		new Map();
	private readonly _onAction: <T extends ACTION, D>(
		action: IAction<T, D>
	) => void;

	constructor(
		frame: IFrame,
		facadeMap: Record<WIDGETS, IWidgetFacadeConstructor>,
		onAction: <T extends ACTION, D>(action: IAction<T, D>) => void
	) {
		const bubbleEvent = createBubbleEventFunc(this);
		const widgetFacadeConstructor = createWidgetFacadeConstructor(
			bubbleEvent,
			facadeMap
		);
		this.children = constructFrameFacade(frame, widgetFacadeConstructor);
		this._bubbleEvent = bubbleEvent;
		this._facadeMap = facadeMap;
		this.widgetFacadeConstructor = widgetFacadeConstructor;
		this._onAction = onAction;
	}

	_handleAction<T extends ACTION, D>(action: IAction<T, D>): void {
		if (!action.defaultPrevented) {
			if (action instanceof AddAction) {
				this._onAdd(action);
			} else if (action instanceof InputAction) {
				this._onInput(action);
			}

			this._onAction(action);
		}
	}

	subscribeFocus(value: IWidgetFacade, callback: FocusCallback): void {
		this._focusCallbackMap.set(value, callback);
	}

	leaveFocus(value: IWidgetFacade, selection: ISelection): void {
		const direction =
			selection.direction === 'down' || selection.direction === 'right'
				? 'right'
				: 'left';
		CFDFSTraverse(value, this, direction, (regular: IWidgetFacade) => {
			if (this._focusCallbackMap.has(regular)) {
				const focusCallback = this._focusCallbackMap.get(regular);
				focusCallback(selection);

				// Возвращаем true, чтобы остановить проход по дереву
				return true;
			}
		});
	}

	toFrame(): IFrame {
		return toFrame(this);
	}

	private _onInput(action: IInputAction): void {
		if (action.isInsertText()) {
			this._onInsertText(action);
		} else if (action.isInsertParagraph()) {
			this._onInsertParagraph(action);
		} else if (action.isDeleteContentBackward()) {
			this._onDeleteContentBackward(action);
		} else if (action.isDeleteContentForward()) {
			this._onDeleteContentForward(action);
		}
	}

	private _onDeleteContentForward(
		action: IInputAction<IDeleteContentForwardActionData>
	): void {
		deleteContent(false, action.target, action.data.selection);
	}

	private _onDeleteContentBackward(
		action: IInputAction<IDeleteContentBackwardActionData>
	): void {
		deleteContent(true, action.target, action.data.selection);
	}

	private _onInsertParagraph(
		action: IInputAction<IInsertParagraphActionData>
	): void {
		return;
	}

	private _onInsertText(action: IInputAction<IInsertTextActionData>): void {
		insertText(action.target, action.data.selection, action.data.text);
	}

	private _onAdd(action: IAddAction): void {
		addWidget(
			this,
			action.target,
			action.data.position,
			action.getSample(this._facadeMap)
		);
	}
}
