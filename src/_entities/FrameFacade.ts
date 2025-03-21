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
	isCollapsed,
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
import isForward from '@/_utils/selection/isForward';

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
		CFDFSTraverse(value, direction, (regular: IWidgetFacade) => {
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

			const currentSelectedWidgets = computeSelectedWidgets(selection);
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

	toFrame(withPath: boolean = false): IFrame {
		return toFrame(this, withPath);
	}

	private _onRemove(action: IRemoveAction): void {
		removeWidget(action.target);
	}

	private _onInput(action: IInputAction): void {
		if (action.isInsertText()) {
			this._onInsertText(action);
		} else if (action.isInsertParagraph()) {
			this._onInsertParagraph(action);
		} else if (action.isDeleteContentBackward()) {
			this._onDeleteContent(action, false);
		} else if (action.isDeleteContentForward()) {
			this._onDeleteContent(action, true);
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
		const [textFacade, offset] = mergeText(action.target, forward);

		if (textFacade && typeof offset === 'number') {
			this._applyFocus(textFacade, {
				anchorText: textFacade,
				focusText: textFacade,
				anchorOffset: offset,
				focusOffset: offset,
				direction: null,
				offset: null,
			});
		}
	}

	private _onDeleteContent(
		action: IInputAction<IDeleteContentBackwardActionData>,
		forward: false
	): void;
	private _onDeleteContent(
		action: IInputAction<IDeleteContentForwardActionData>,
		forward: true
	): void;
	private _onDeleteContent(
		action:
			| IInputAction<IDeleteContentForwardActionData>
			| IInputAction<IDeleteContentBackwardActionData>,
		forward: boolean
	): void {
		const selection = action.data.selection;
		const isCollapsedSelection = isCollapsed(selection);
		const isForwardSelection = isForward(selection);

		deleteContent(selection, forward);

		const textOffsetModifier = forward ? 0 : -1;
		const textOffsetAfterInput = isCollapsedSelection
			? selection.anchorOffset + textOffsetModifier
			: isForwardSelection
				? selection.anchorOffset
				: selection.focusOffset;

		const textAfterInput = isForwardSelection
			? selection.anchorText
			: selection.focusText;

		const selectionAfterInput = {
			anchorText: textAfterInput,
			focusText: textAfterInput,
			anchorOffset: textOffsetAfterInput,
			focusOffset: textOffsetAfterInput,
			direction: null,
			offset: null,
		};

		this._applyFocus(textAfterInput, selectionAfterInput);
	}

	private _onInsertParagraph(
		action: IInputAction<IInsertParagraphActionData>
	): void {
		const newText = insertParagraph(action.data.selection);

		this._applyFocus(newText, {
			anchorText: newText,
			focusText: newText,
			anchorOffset: 0,
			focusOffset: 0,
			offset: null,
			direction: 'right',
		});
	}

	/**
	 * TODO: Должен работать только от селекшена, там уже есть вся нужная инфа
	 */
	private _applyFocus(widget: IWidgetFacade, selection: ISelection): void {
		const focusCallback = this._focusCallbackMap.get(widget);
		if (focusCallback) {
			focusCallback(selection);
		}
	}

	private _onInsertText(action: IInputAction<IInsertTextActionData>): void {
		const selection = action.data.selection;
		insertText(action.data.text, action.data.selection);

		const isForwardSelection = isForward(selection);
		const startOffset = isForwardSelection
			? selection.anchorOffset
			: selection.focusOffset;
		const startText = isForwardSelection
			? selection.anchorText
			: selection.focusText;

		const textOffsetAfterInput = startOffset + 1;

		const selectionAfterInput: ISelection = {
			anchorText: startText,
			focusText: startText,
			anchorOffset: textOffsetAfterInput,
			focusOffset: textOffsetAfterInput,
			direction: null,
			offset: null,
		};
		this._applyFocus(startText, selectionAfterInput);
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
