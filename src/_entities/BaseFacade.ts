import {
	ACTION,
	BubbleEventFunc,
	IAction,
	IAddAction,
	IAddActionData,
	IBaseFacade,
	IBaseFacadeCfg,
	IProperties,
	IWidget,
	IWidgetFacade,
	Path,
	PLAIN_TEXT_FACADE_TYPE,
	SmartPath,
	UUID,
	WIDGETS,
} from 'types';
import { ChildrenSetter, widgetToFrame } from 'utils';
import { AddAction, createAction } from './Action';

export default abstract class BaseFacade<Properties extends IProperties = {}>
	implements IBaseFacade<Properties>
{
	readonly type: WIDGETS | typeof PLAIN_TEXT_FACADE_TYPE;
	readonly id: UUID;
	readonly properties: Properties;

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

	private readonly _bubbleEvent: BubbleEventFunc;
	private _path: SmartPath;
	private _children: IBaseFacade[];

	constructor({
		id,
		path,
		properties,
		children,
		type,
		bubbleEvent,
	}: IBaseFacadeCfg<Properties>) {
		this.id = id;
		this._path = path;
		this.type = type;
		this.properties = properties;
		this._children = children;
		this._bubbleEvent = bubbleEvent;
	}

	add(addActionData: IAddActionData): void {
		const addAction = createAction(ACTION.ADD, {
			initiator: this,
			target: this,
			data: addActionData,
		});

		this._notify(addAction);
	}

	toFrame(): IWidget<Properties> | string {
		return widgetToFrame(this);
	}

	_handleAction<T extends ACTION, D>(
		action: IAction<T, D, IWidgetFacade<{}> | IWidgetFacade<{}>[]>
	): void {
		if (action instanceof AddAction) {
			this._onAdd(action);
		}
	}

	protected _notify<T extends ACTION, D>(action: IAction<T, D>): void {
		console.log('notify action', action);
		this._bubbleEvent(this.path, action);
	}

	private _onAdd(action: IAddAction): void {
		console.log(this.path, action);
	}
}
