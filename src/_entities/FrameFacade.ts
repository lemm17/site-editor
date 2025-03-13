import {
	CFDFSTraverse,
	ChildrenSetter,
	constructFrameFacade,
	correctChildIndexes,
	createBubbleEventFunc,
	createWidgetFacadeConstructor,
	getEdgesInfo,
	getWFByPath,
	cloneSmartPathOfTargetAndIncrementIfNeed,
	insertTextCrossWidget,
	splitChildrenByPosition,
	toFrame,
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
	Index,
	IWidget,
	UUID,
	FocusCallback,
	ISelection,
	IInputAction,
	IInsertTextActionData,
	IInsertParagraphActionData,
	IDeleteContentBackwardActionData,
	IDeleteContentForwardActionData,
	SmartIndex,
} from 'types';
import { AddAction, InputAction } from './Action';

export default class FrameFacade implements IFrameFacade {
	readonly children: IWidgetFacade[];
	private readonly _bubbleEvent: BubbleEventFunc;
	private readonly _facadeMap: Record<WIDGETS, IWidgetFacadeConstructor>;
	private readonly _widgetFacadeConstructor: WidgetFacadeConstructor;
	private _selection: {
		id: UUID;
		selection: ISelection;
	};
	private readonly _focusCallbackMap: WeakMap<IWidgetFacade, FocusCallback> =
		new Map();
	get path(): Path {
		return [];
	}
	get smartPath(): SmartPath {
		return [];
	}

	constructor(
		frame: IFrame,
		facadeMap: Record<WIDGETS, IWidgetFacadeConstructor>
	) {
		const bubbleEvent = createBubbleEventFunc(this);
		const widgetFacadeConstructor = createWidgetFacadeConstructor(
			bubbleEvent,
			facadeMap
		);
		this.children = constructFrameFacade(frame, widgetFacadeConstructor);
		this._bubbleEvent = bubbleEvent;
		this._facadeMap = facadeMap;
		this._widgetFacadeConstructor = widgetFacadeConstructor;
	}

	_handleEvent<T extends ACTION, D>(action: IAction<T, D>): void {
		if (!action.defaultPrevented) {
			if (action instanceof AddAction) {
				this._onAdd(action);
			} else if (action instanceof InputAction) {
				this._onInput(action);
			}
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
		return;
	}

	private _onDeleteContentBackward(
		action: IInputAction<IDeleteContentBackwardActionData>
	): void {
		return;
	}

	private _onInsertParagraph(
		action: IInputAction<IInsertParagraphActionData>
	): void {
		return;
	}

	private _onInsertText(action: IInputAction<IInsertTextActionData>): void {
		const text = action.data.text;
		const target = action.target;

		const edgesInfo = getEdgesInfo(target, action.data.selection);

		if (edgesInfo.startChild === edgesInfo.endChild) {
			edgesInfo.startChild.insertText(
				text,
				edgesInfo.startIndexRelativeToStartChild,
				edgesInfo.endIndexRelativeToEndChild
			);
		} else {
			const newChildren = insertTextCrossWidget(target, text, edgesInfo);

			const setter = ChildrenSetter.getSetter(target.children);
			setter(newChildren);
			target.children = newChildren;
		}
	}

	/**
	 * TODO: Вынести внутрянку в хэлпер
	 */
	private _onAdd(action: IAddAction): void {
		const smartPathForNewElement = cloneSmartPathOfTargetAndIncrementIfNeed(
			action.target as IWidgetFacade,
			action.data.position === 'after'
		);

		const parentPath = action.target.path.slice(0, -1);
		const parent = getWFByPath(this, parentPath);
		const sample = action.getSample(this._facadeMap);
		const newWidget = this._widgetFacadeConstructor(
			sample,
			smartPathForNewElement,
			parent.toFrame()
		) as IWidgetFacade;

		const [leftPart, rightPart] = splitChildrenByPosition(
			this,
			action.target as IWidgetFacade,
			action.data.position
		);

		const newChildren = [...leftPart, newWidget, ...rightPart];
		correctChildIndexes(rightPart, leftPart.length + 1);

		parent.children = newChildren;
	}
}
