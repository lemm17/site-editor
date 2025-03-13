import { default as createUUID } from './uuid';
import {
	BubbleEventFunc,
	WidgetFacadeConstructor,
	Frame,
	IFrame,
	Index,
	IWidget,
	IWidgetFacade,
	IWidgetFacadeConstructor,
	SmartPath,
	WIDGETS,
	PLAIN_TEXT_FACADE_TYPE,
	IBaseFacade,
	WidgetFacadeCreator,
	IPlainTextFacade,
} from 'types';
import { PlainTextFacade } from 'entities';

export function createWidgetFacadeConstructors(
	bubbleEvent: BubbleEventFunc,
	facadeMap: Record<WIDGETS, IWidgetFacadeConstructor>
): [WidgetFacadeConstructor, WidgetFacadeCreator] {
	const constructWidgetFacade: WidgetFacadeConstructor = <
		P extends object = {},
	>(
		widget: IWidget<P>,
		path: SmartPath,
		parent: IWidget
	): IBaseFacade<P> | IPlainTextFacade => {
		const isParentTextWidget = parent && Frame.isTextWidget(parent);
		if (isParentTextWidget && typeof widget === 'string') {
			return createWidgetFacade(
				PLAIN_TEXT_FACADE_TYPE,
				path,
				{} as P,
				[],
				widget
			);
		}

		if (!Frame.isWidget(widget)) {
			throw new Error(`object ${widget} is not a widget`);
		}

		const children = Frame.getChildren(widget);

		const childrenFacades: IBaseFacade[] = children.map(
			(child: IWidget, index: Index) => {
				return constructWidgetFacade(child, [...path, [index]], widget);
			}
		);

		const name = Frame.getName(widget);
		const props = Frame.getProps(widget);

		return createWidgetFacade(name, path, props, childrenFacades);
	};

	const createWidgetFacade: WidgetFacadeCreator = <P extends object = {}>(
		type: WIDGETS | typeof PLAIN_TEXT_FACADE_TYPE,
		path: SmartPath,
		properties: P,
		children: IBaseFacade[],
		text: string = ''
	) => {
		if (type === PLAIN_TEXT_FACADE_TYPE) {
			return new PlainTextFacade({
				id: createUUID(),
				path,
				type: PLAIN_TEXT_FACADE_TYPE,
				properties: {} as P,
				children: [],
				bubbleEvent,
				text,
			});
		}

		const Facade = facadeMap[WIDGETS[type]] as IWidgetFacadeConstructor<P>;

		return new Facade({
			id: createUUID(),
			path,
			type,
			properties,
			children,
			bubbleEvent,
		});
	};

	return [constructWidgetFacade, createWidgetFacade];
}

export default function constructFrameFacade(
	frame: IFrame,
	widgetFacadeConstructor: WidgetFacadeConstructor
): IWidgetFacade[] {
	if (!Frame.isFrame(frame)) {
		throw new Error(`object ${frame} is not a frame`);
	}

	return Frame.getChildren(frame).map((widget: IWidget, index: Index) => {
		return widgetFacadeConstructor(widget, [[index]], null);
	}) as IWidgetFacade[];
}
