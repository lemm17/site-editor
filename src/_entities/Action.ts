import {
	IProperties,
	Path,
	ACTION,
	IActionParams,
	IAction,
	IWidgetFacade,
	IAddAction,
	IChangeAction,
	IRemoveAction,
	ITransferAction,
	IReplaceAction,
	IAddActionParams,
	IChangeActionParams,
	IRemoveActionParams,
	ITransferActionParams,
	IReplaceActionParams,
	IAddActionData,
	IBaseFacade,
	ITextWidgetFacade,
	IInputAction,
	IInputActionParams,
	IInputActionData,
	IInsertTextActionData,
	IInsertParagraphActionData,
	IDeleteContentBackwardActionData,
	IDeleteContentForwardActionData,
	IWidget,
	WIDGETS,
	IWidgetFacadeConstructor,
} from 'types';

export abstract class Action<
	Type extends ACTION,
	Data,
	Target = IWidgetFacade | IWidgetFacade[],
> implements IAction<Type, Data, Target>
{
	readonly initiator: IBaseFacade;
	readonly type: Type;
	readonly data: Data;
	readonly target: Target;
	private _defaultPrevented: boolean = false;
	private _stopped: boolean = false;
	get defaultPrevented(): boolean {
		return this._defaultPrevented;
	}
	get stopped(): boolean {
		return this._stopped;
	}

	constructor(type: Type, params: IActionParams<Data, Target>) {
		this.initiator = params.initiator;
		this.type = type;
		this.target = params.target;
		this.data = params.data;
	}

	preventDefault(): void {
		this._defaultPrevented = true;
	}

	stopPropagation(): void {
		this._stopped = true;
	}
}

export class AddAction
	extends Action<ACTION.ADD, IAddActionData, IWidgetFacade>
	implements IAddAction
{
	getSample(facadeMap: Record<WIDGETS, IWidgetFacadeConstructor>): IWidget {
		if ('sample' in this.data) {
			return this.data.sample;
		}
		if ('widget' in this.data) {
			const widget = this.data.widget;
			const Facade = facadeMap[WIDGETS[widget]] as IWidgetFacadeConstructor;
			return Facade.sample;
		}

		throw new Error('incorrect action data: no sample, no widget');
	}
}

export class ChangeAction
	extends Action<ACTION.CHANGE, IProperties, IWidgetFacade>
	implements IChangeAction {}

export class RemoveAction
	extends Action<ACTION.REMOVE, null, IWidgetFacade>
	implements IRemoveAction {}

export class TransferAction
	extends Action<ACTION.TRANSFER, Path, IWidgetFacade>
	implements ITransferAction {}

export class ReplaceAction
	extends Action<ACTION.REPLACE, IWidgetFacade[], IWidgetFacade[]>
	implements IReplaceAction {}

export class InputAction<D extends IInputActionData = IInputActionData>
	extends Action<ACTION.INPUT, D, ITextWidgetFacade>
	implements IInputAction<D>
{
	isInsertText(): this is InputAction<IInsertTextActionData> {
		return this.data.type === 'insertText';
	}
	isInsertParagraph(): this is InputAction<IInsertParagraphActionData> {
		return this.data.type === 'insertParagraph';
	}
	isDeleteContentBackward(): this is InputAction<IDeleteContentBackwardActionData> {
		return this.data.type === 'deleteContentBackward';
	}
	isDeleteContentForward(): this is InputAction<IDeleteContentForwardActionData> {
		return this.data.type === 'deleteContentForward';
	}
}

export function createAction(
	action: ACTION.ADD,
	params: IAddActionParams
): AddAction;
export function createAction(
	action: ACTION.CHANGE,
	params: IChangeActionParams
): ChangeAction;
export function createAction(
	action: ACTION.REMOVE,
	params: IRemoveActionParams
): RemoveAction;
export function createAction(
	action: ACTION.TRANSFER,
	params: ITransferActionParams
): TransferAction;
export function createAction(
	action: ACTION.REPLACE,
	params: IReplaceActionParams
): ReplaceAction;
export function createAction(
	action: ACTION.INPUT,
	params: IInputActionParams
): InputAction;
export function createAction<T extends ACTION>(
	action: T,
	params: any
): Action<any, any> {
	switch (action) {
		case ACTION.ADD:
			return new AddAction(ACTION.ADD, params);
		case ACTION.CHANGE:
			return new ChangeAction(ACTION.CHANGE, params);
		case ACTION.REMOVE:
			return new RemoveAction(ACTION.REMOVE, params);
		case ACTION.TRANSFER:
			return new TransferAction(ACTION.TRANSFER, params);
		case ACTION.REPLACE:
			return new ReplaceAction(ACTION.REPLACE, params);
		case ACTION.INPUT:
			return new InputAction(ACTION.INPUT, params);
		default:
			throw new Error('Unknown action type');
	}
}
