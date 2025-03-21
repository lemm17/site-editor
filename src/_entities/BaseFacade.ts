import {
	ACTION,
	BubbleEventFunc,
	IAction,
	IAddAction,
	IAddActionData,
	IBaseFacade,
	IBaseFacadeCfg,
	IFrameFacade,
	IProperties,
	IWidget,
	IWidgetFacadeMap,
	Path,
	PLAIN_TEXT_FACADE_TYPE,
	SmartPath,
	UUID,
	WidgetFacadeCreator,
	WIDGETS,
} from 'types';
import { ChildrenSetter, widgetToFrame } from 'utils';
import { AddAction, createAction } from './Action';

export default abstract class BaseFacade<Properties extends IProperties = {}>
	implements IBaseFacade<Properties>
{
	readonly widgetFacadeCreator: WidgetFacadeCreator;
	readonly widgetFacadeMap: IWidgetFacadeMap;
	readonly bubbleEvent: BubbleEventFunc;
	readonly type: WIDGETS | typeof PLAIN_TEXT_FACADE_TYPE;
	readonly id: UUID;
	readonly properties: Properties;
	readonly frameFacade: IFrameFacade;
	readonly isInline: boolean;

	get path(): Path {
		return this._path.map((x) => x[0]);
	}
	get smartPath(): SmartPath {
		return this._path;
	}
	set smartPath(newSmartPath: SmartPath) {
		this._path = newSmartPath;
	}
	get children(): IBaseFacade[] {
		return this._children;
	}
	set children(newChildren: IBaseFacade[]) {
		const setter = ChildrenSetter.getSetter(this._children);
		setter(newChildren);
		this._children = newChildren;
	}

	private _path: SmartPath;
	private _children: IBaseFacade[];

	constructor({
		id,
		path,
		properties,
		children,
		type,
		bubbleEvent,
		widgetFacadeCreator,
		widgetFacadeMap,
		frameFacade,
	}: IBaseFacadeCfg<Properties>) {
		this.id = id;
		this._path = path;
		this.type = type;
		this.properties = properties;
		this._children = children;
		this.bubbleEvent = bubbleEvent;
		this.widgetFacadeCreator = widgetFacadeCreator;
		this.widgetFacadeMap = widgetFacadeMap;
		this.frameFacade = frameFacade;
	}

	add(addActionData: IAddActionData, initiator: IBaseFacade = this): void {
		const addAction = createAction(ACTION.ADD, {
			initiator,
			target: this,
			data: addActionData,
		});

		this._notify(addAction);
	}

	remove(initiator: IBaseFacade = this): void {
		const deleteAction = createAction(ACTION.REMOVE, {
			initiator,
			target: this,
			data: null,
		});

		this._notify(deleteAction);
	}

	toFrame(withPath: boolean = false): IWidget<Properties> | string {
		return widgetToFrame(this, withPath);
	}

	_handleAction<T extends ACTION, D>(action: IAction<T, D>): void {
		if (action instanceof AddAction) {
			this._onAdd(action);
		}
	}

	protected _notify<T extends ACTION, D>(action: IAction<T, D>): void {
		console.log('notify action', action);
		this.bubbleEvent(this.path, action);
	}

	private _onAdd(action: IAddAction): void {
		console.log(this.path, action);
	}
}
