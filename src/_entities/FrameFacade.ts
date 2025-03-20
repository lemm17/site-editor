import {
	CFDFSTraverse,
	constructFrameFacade,
	createBubbleEventFunc,
	createWidgetFacadeConstructors,
	toFrame,
	deleteContent,
	insertText,
	addWidget,
	insertParagraph,
	ChildrenSetter,
	mergeText,
	removeWidget,
	computeSelectedWidgets,
} from 'utils';
import {
	IFrame,
	BubbleEventFunc,
	IWidgetFacade,
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
	WidgetFacadeCreator,
	IRemoveAction,
	IWidgetFacadeMap,
	IMergeContentForwardActionData,
	IMergeContentBackwardActionData,
	ITextWidgetFacade,
	IAnchorPoint,
	IFocusPoint,
	IDirection,
	IBaseFacade,
} from 'types';
import { AddAction, InputAction, RemoveAction } from './Action';

export default class FrameFacade implements IFrameFacade {
	readonly isFrameFacade: true = true;
	readonly widgetFacadeConstructor: WidgetFacadeConstructor;
	readonly widgetFacadeCreator: WidgetFacadeCreator;
	readonly widgetFacadeMap: IWidgetFacadeMap;
	readonly bubbleEvent: BubbleEventFunc;

	// -----
	// TODO
	// Копипаста из BaseFacade
	// Эта логика должна быть в базовом классе Facade
	get children(): IWidgetFacade[] {
		return this._children;
	}
	set children(newChildren: IWidgetFacade[]) {
		const setter = ChildrenSetter.getSetter(this._children);
		setter(newChildren);
		this._children = newChildren;
	}
	private _children: IWidgetFacade[];
	// -----

	get path(): Path {
		return [];
	}
	get smartPath(): SmartPath {
		return [];
	}
	get anchorPoint(): IAnchorPoint {
		return this._anchorPoint;
	}

	private readonly _focusCallbackMap: WeakMap<IWidgetFacade, FocusCallback> =
		new Map();
	private readonly _onAction: <T extends ACTION, D>(
		action: IAction<T, D>
	) => void;
	private _anchorPoint: IAnchorPoint = null;
	private _selectedWidgets: IWidgetFacade[] = [];

	constructor(
		frame: IFrame,
		facadeMap: IWidgetFacadeMap,
		onAction: <T extends ACTION, D>(action: IAction<T, D>) => void
	) {
		const bubbleEvent = createBubbleEventFunc(this);
		const [widgetFacadeConstructor, widgetFacadeCreator] =
			createWidgetFacadeConstructors(bubbleEvent, facadeMap, this);

		this.widgetFacadeMap = facadeMap;
		this.widgetFacadeConstructor = widgetFacadeConstructor;
		this.widgetFacadeCreator = widgetFacadeCreator;

		this._children = constructFrameFacade(frame, widgetFacadeConstructor);
		this.bubbleEvent = bubbleEvent;
		this._onAction = onAction;
	}

	_handleAction<T extends ACTION, D>(action: IAction<T, D>): void {
		if (!action.defaultPrevented) {
			if (action instanceof AddAction) {
				this._onAdd(action);
			} else if (action instanceof InputAction) {
				this._onInput(action);
			} else if (action instanceof RemoveAction) {
				this._onRemove(action);
			}

			this._onAction(action);
		}
	}

	_subscribeFocus(value: IWidgetFacade, callback: FocusCallback): void {
		this._focusCallbackMap.set(value, callback);
	}

	_leaveFocus(value: IWidgetFacade, selection: ISelection): void {
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

	_mouseLeaveText(
		value: ITextWidgetFacade,
		anchorOffset: IAnchorPoint['anchorOffset']
	): void {
		if (!this._anchorPoint) {
			this._anchorPoint = {
				anchorText: value,
				anchorOffset,
			};
			this._selectedWidgets = [value];

			// Создаем функцию, чтобы отследить ближайший mouseup
			// После mouseup любое изменение selection приводит к сбросу выделенных виджетов
			// Сбасываем и не забываем отписываться.
			const onMouseUp = () => {
				document.removeEventListener('mouseup', onMouseUp);
				const onSelectionChange = () => {
					this._selectedWidgets.forEach((selectedWidget) => {
						this._applyFocus(selectedWidget, null);
					});
					this._selectedWidgets = [];
					this._anchorPoint = null;

					document.removeEventListener(
						'selectionchange',
						onSelectionChange
					);
				};
				document.addEventListener('selectionchange', onSelectionChange);
			};

			document.addEventListener('mouseup', onMouseUp, { capture: true });
		}
	}

	_mouseEnterText(
		value: ITextWidgetFacade,
		focusOffset: IFocusPoint['focusOffset'],
		direction: IDirection
	): void {
		if (this._anchorPoint && this._selectedWidgets) {
			const selection: ISelection = {
				...this._anchorPoint,
				focusText: value,
				focusOffset,
				direction,
				offset: null,
			};

			const currentSelectedWidgets = computeSelectedWidgets(selection, this);
			this._selectedWidgets.forEach((widget) => {
				const shouldUnselect = !currentSelectedWidgets.includes(widget);
				if (shouldUnselect) {
					this._applyFocus(widget, null);
				}
			});

			currentSelectedWidgets.forEach((selectedWidget) => {
				this._applyFocus(selectedWidget, selection);
			});
			this._selectedWidgets = currentSelectedWidgets;
		}
	}

	toFrame(): IFrame {
		return toFrame(this);
	}

	private _onRemove(action: IRemoveAction): void {
		removeWidget(action.target, this);
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
		} else if (action.isMergeContentBackward()) {
			this._onMergeContent(action, false);
		} else if (action.isMergeContentForward()) {
			this._onMergeContent(action, true);
		}
	}

	private _onMergeContent(
		action: IInputAction<IMergeContentBackwardActionData>,
		forward: false
	): void;
	private _onMergeContent(
		action: IInputAction<IMergeContentForwardActionData>,
		forward: true
	): void;
	private _onMergeContent(
		action:
			| IInputAction<IMergeContentBackwardActionData>
			| IInputAction<IMergeContentForwardActionData>,
		forward: boolean
	): void {
		const [textFacade, offset] = mergeText(action.target, this, forward);

		if (textFacade && typeof offset === 'number') {
			this._applyFocus(textFacade, {
				anchor: offset,
				focus: offset,
				direction: null,
				offset: null,
			});
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
		const newText = insertParagraph(
			action.target,
			this,
			action.data.selection
		);

		this._applyFocus(newText, {
			anchor: 0,
			focus: 0,
			offset: null,
			direction: 'right',
		});
	}

	private _applyFocus(widget: IWidgetFacade, selection: ISelection): void {
		const focusCallback = this._focusCallbackMap.get(widget);
		if (focusCallback) {
			focusCallback(selection);
		}
	}

	private _onInsertText(action: IInputAction<IInsertTextActionData>): void {
		insertText(action.target, action.data.selection, action.data.text);
	}

	private _onAdd(action: IAddAction): void {
		addWidget(
			this,
			action.target,
			action.data.position,
			action.getSample(this.widgetFacadeMap)
		);
	}
}
