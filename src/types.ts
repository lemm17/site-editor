import { JSXElement } from 'solid-js';

export type UUID = string;

export type Index = number;

export type Path = Index[];

export type SmartIndex = [Index];

export type SmartPath = readonly SmartIndex[];

export type IProperties = object;

export type Position = 'before' | 'after';

export type IWidget<TWidgetProps extends object = {}> = [
	WIDGETS,
	TWidgetProps | IWidgetChild,
	...IWidgetChild[],
];

export type BubbleEventFunc = <T extends ACTION, D>(
	path: Path,
	action: IAction<T, D>
) => void;

export interface IActionParams<Data, Target = IBaseFacade> {
	initiator: IBaseFacade;
	data: Data;
	target: Target;
}

export interface IAction<
	Type extends ACTION,
	Data,
	Target = IBaseFacade | IBaseFacade[],
> {
	readonly initiator: IBaseFacade;
	readonly type: Type;
	readonly data: Data;
	readonly target: Target;
	get defaultPrevented(): boolean;
	get stopped(): boolean;

	preventDefault(): void;
	stopPropagation(): void;
}

export interface IAddAction
	extends IAction<ACTION.ADD, IAddActionData, IBaseFacade> {
	getSample(facadeMap: Record<WIDGETS, IWidgetFacadeConstructor>): IWidget;
}
export interface IAddActionDataByWidget {
	position: Position;
	widget: WIDGETS;
}
export interface IAddActionDataBySample {
	position: Position;
	sample: IWidget;
}
export type IAddActionData = IAddActionDataByWidget | IAddActionDataBySample;
export type IAddActionParams = IActionParams<IAddActionData>;

export interface IChangeAction
	extends IAction<ACTION.CHANGE, IProperties, IWidgetFacade> {}
export type IChangeActionParams = IActionParams<IProperties>;

export interface IRemoveAction
	extends IAction<ACTION.REMOVE, null, IWidgetFacade> {}
export type IRemoveActionParams = IActionParams<null>;

export interface ITransferAction
	extends IAction<ACTION.TRANSFER, Path, IWidgetFacade> {}
export type ITransferActionParams = IActionParams<Path>;

export interface IReplaceAction
	extends IAction<ACTION.REPLACE, IWidgetFacade[], IWidgetFacade[]> {}
export type IReplaceActionParams = IActionParams<
	IWidgetFacade[],
	IWidgetFacade[]
>;

export interface IBaseInputActionData {
	type:
		| 'insertText'
		| 'insertParagraph'
		| 'deleteContentBackward'
		| 'deleteContentForward';
	timeStamp: number;
	selection: ISelection;
}
export interface IInsertTextActionData extends IBaseInputActionData {
	type: 'insertText';
	text: string;
}
export interface IInsertParagraphActionData extends IBaseInputActionData {
	type: 'insertParagraph';
}
export interface IDeleteContentBackwardActionData extends IBaseInputActionData {
	type: 'deleteContentBackward';
	text: string;
}
export interface IDeleteContentForwardActionData extends IBaseInputActionData {
	type: 'deleteContentForward';
}
export type IInputActionData =
	| IInsertTextActionData
	| IInsertParagraphActionData
	| IDeleteContentBackwardActionData
	| IDeleteContentForwardActionData;
export interface IInputAction<D extends IInputActionData = IInputActionData>
	extends IAction<ACTION.INPUT, D, ITextWidgetFacade> {
	isInsertText(): this is IInputAction<IInsertTextActionData>;
	isInsertParagraph(): this is IInputAction<IInsertParagraphActionData>;
	isDeleteContentBackward(): this is IInputAction<IDeleteContentBackwardActionData>;
	isDeleteContentForward(): this is IInputAction<IDeleteContentForwardActionData>;
}
export type IInputActionParams = IActionParams<
	IInputActionData,
	ITextWidgetFacade
>;

export interface IBaseFacadeCfg<Properties extends IProperties = {}> {
	id: UUID;
	type: WIDGETS | typeof PLAIN_TEXT_FACADE_TYPE;
	path: SmartPath;
	properties: Properties;
	children: IBaseFacade[];
	bubbleEvent: BubbleEventFunc;
}

export interface IWidgetFacadeCfg<Properties extends IProperties = {}>
	extends IBaseFacadeCfg<Properties> {
	type: WIDGETS;
	properties: Properties;
	children: IBaseFacade[];
}

export interface IPlainTextFacadeCfg extends IBaseFacadeCfg<{}> {
	properties: {};
	text: string;
	type: typeof PLAIN_TEXT_FACADE_TYPE;
	children: [];
}

export interface IFacade<T extends IFacade<T>> {
	children: T[];

	get path(): Path;
	get smartPath(): SmartPath;

	_handleAction<T extends ACTION, D>(action: IAction<T, D>): void;
	toFrame(): IWidget | IFrame | string;
}

export const PLAIN_TEXT_FACADE_TYPE = 'plainText';

export interface IBaseFacade<Properties extends IProperties = {}>
	extends IFacade<IBaseFacade> {
	readonly id: UUID;
	readonly type: WIDGETS | typeof PLAIN_TEXT_FACADE_TYPE;
	readonly properties: Properties;

	add(addActionData: IAddActionData): void;
	toFrame(): IWidget | string;
}

export interface IWidgetFacade<Properties extends IProperties = {}>
	extends IBaseFacade<Properties> {
	readonly type: WIDGETS;
	readonly isInline: boolean;

	toFrame(): IWidget;
}

export interface ITextWidgetFacade<Properties extends IProperties = {}>
	extends IWidgetFacade<Properties> {
	readonly type: WIDGETS.text;

	input(data: IInputActionData): void;
}

export interface IPlainTextFacade extends IBaseFacade {
	children: [];

	get text(): string;

	readonly id: UUID;
	readonly type: typeof PLAIN_TEXT_FACADE_TYPE;
	readonly properties: {};

	insertText(insertText: string, startIndex: number, endIndex?: number): void;
	toFrame(): string;
}

export interface IWidgetFacadeConstructor<Properties extends IProperties = {}> {
	new (cfg: IWidgetFacadeCfg<Properties>): IWidgetFacade<Properties>;

	// static
	sample: IWidget;
}

export type IWidgetChild = IWidget | ITextWidget;

export interface ITextWidgetProps {}

export type ITextWidget = [
	WIDGETS.text,
	ITextWidgetProps | ITextWidgetChild,
	...ITextWidgetChild[],
];

export type IUserText = string;

export type ITextWidgetChild = ILeafWidget | IUserText;

export type ILeafWidget<TWidgetProps extends object = {}> = [
	string,
	TWidgetProps,
];

export type IFrame = ['frame', {}, ...IWidget[]];

export type FocusCallback = (selection: ISelection) => void;

export interface IFrameFacade extends IFacade<IBaseFacade> {
	children: IWidgetFacade[];

	subscribeFocus(id: IWidgetFacade, callback: FocusCallback): void;
	leaveFocus(value: IWidgetFacade, selection: ISelection): void;
	toFrame(): IFrame;
}

export type IDirection = 'up' | 'right' | 'down' | 'left' | 'home' | 'end';

export interface ISelection {
	focus: number;
	anchor: number;
	direction: IDirection | null;
	offset: number;
}

export interface ICaretPosition {
	node: Node;
	offset: number;
	rect?: Omit<DOMRect, 'toJSON'>;
}

export interface ICursorInfo {
	offset?: number;
	isCollapsed: boolean;
	isCursorOnFirstLine: boolean;
	isCursorOnLastLine: boolean;
	isCursorOnStart: boolean;
	isCursorOnEnd: boolean;
	rangeCoords: { startX: number; endX: number };
}

export abstract class Frame {
	static isWidget(candidate: any): candidate is IWidget {
		if (Array.isArray(candidate) && candidate.length > 1) {
			const [name, propsOrArray] = candidate;

			if (Frame.isTextWidget(candidate)) {
				return true;
			}

			return typeof name === 'string' && typeof propsOrArray === 'object';
		}

		return false;
	}

	static isFrame(candidate: any): candidate is IFrame {
		return Frame.isWidget(candidate) && (candidate[0] as string) === 'frame';
	}

	static isTextWidget(candidate: any): candidate is ITextWidget {
		if (Array.isArray(candidate) && candidate.length > 1) {
			const [name, propsOrWidgetOrUserText] = candidate;

			return (
				name === WIDGETS.text &&
				['object', 'string'].includes(typeof propsOrWidgetOrUserText)
			);
		}

		return false;
	}

	static getName(widget: IWidget): string {
		return widget[0];
	}

	static getProps<TNodeProps extends object = {}>(
		widget: IWidget<TNodeProps>
	): TNodeProps {
		const propsOrWidget = widget[1];
		if (
			Array.isArray(propsOrWidget) ||
			(Frame.isTextWidget(widget) && typeof propsOrWidget === 'string')
		) {
			return {} as TNodeProps;
		}

		return propsOrWidget;
	}

	static hasChildren(widget: IWidget): boolean {
		return Frame.getChildren(widget).length > 0;
	}

	static getChildren(widget: IWidget | IFrame): IWidget[] {
		const [_, firstChild, ...restChildren] = widget;

		if (Array.isArray(firstChild) || typeof firstChild === 'string') {
			return [firstChild, ...restChildren] as IWidget[];
		}

		return restChildren as IWidget[];
	}
}

export interface IWidgetComponentProps<T extends object = {}> {
	value: IWidgetFacade<T>;
	children?: JSXElement;
}

export interface ITextWidgetComponentProps<T extends object = {}>
	extends IWidgetComponentProps<T> {
	value: ITextWidgetFacade<T>;
}

export const INLINE_WIDGET_OFFSET_LENGTH = 1;

export type IWidgetComponent = <T extends object = {}>(
	props: IWidgetComponentProps<T>
) => JSXElement;

export interface IEmojiProps {
	value: string;
}

export type WidgetFacadeConstructor = (
	widget: IWidget,
	path: SmartPath,
	parent: IWidget
) => IBaseFacade;

export interface IEdgesInfo {
	startChild: IPlainTextFacade;
	startChildIndexInParent: number;
	startIndexRelativeToStartChild: number;
	endChild: IPlainTextFacade;
	endChildIndexInParent: number;
	endIndexRelativeToEndChild: number;
}

export enum WIDGETS {
	text = 'text',
	blockquote = 'blockquote',
	emoji = 'emoji',
}

export enum ACTION {
	ADD,
	CHANGE,
	REMOVE,
	TRANSFER,
	REPLACE,
	INPUT,
}
