import { default as createUUID } from './uuid';
import {
	BubbleEventFunc,
	WidgetFacadeConstructor,
	Frame,
	IFrame,
	Index,
	IWidget,
	IWidgetFacade,
	WIDGETS,
	PLAIN_TEXT_FACADE_TYPE,
	IBaseFacade,
	WidgetFacadeCreator,
	IWidgetFacadeMap,
	IPlainTextFacade,
	SmartPath,
	IFrameFacade,
} from 'types';

export function createWidgetFacadeConstructors(
	bubbleEvent: BubbleEventFunc,
	widgetFacadeMap: IWidgetFacadeMap,
	frameFacade: IFrameFacade
): [WidgetFacadeConstructor, WidgetFacadeCreator] {
	const constructWidgetFacade: WidgetFacadeConstructor = (
		widget,
		path,
		parent
	) => {
		const isParentTextWidget = parent && Frame.isTextWidget(parent);
		if (isParentTextWidget && typeof widget === 'string') {
			return widgetFacadeCreator(
				PLAIN_TEXT_FACADE_TYPE,
				path,
				{},
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

		return widgetFacadeCreator(name, path, props, childrenFacades);
	};

	const widgetFacadeCreator: WidgetFacadeCreator = (
		type,
		path,
		properties,
		children,
		text
	) => {
		if (type === PLAIN_TEXT_FACADE_TYPE) {
			return createPlainTextFacade(
				widgetFacadeMap,
				path,
				widgetFacadeCreator,
				bubbleEvent,
				frameFacade,
				text
			);
		}

		if (type === WIDGETS.text) {
			return new widgetFacadeMap[type]({
				id: createUUID(),
				path,
				type: WIDGETS.text,
				properties: {},
				children,
				bubbleEvent,
				widgetFacadeMap,
				widgetFacadeCreator,
				frameFacade,
			});
		}

		return new widgetFacadeMap[type]({
			id: createUUID(),
			path,
			type: WIDGETS[type],
			properties,
			children,
			bubbleEvent,
			widgetFacadeCreator,
			widgetFacadeMap,
			frameFacade,
		});
	};

	return [constructWidgetFacade, widgetFacadeCreator];
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

export function createPlainTextFacade(
	widgetFacadeMap: IWidgetFacadeMap,
	path: SmartPath,
	widgetFacadeCreator: WidgetFacadeCreator,
	bubbleEvent: BubbleEventFunc,
	frameFacade: IFrameFacade,
	text = ''
): IPlainTextFacade {
	return new widgetFacadeMap[PLAIN_TEXT_FACADE_TYPE]({
		id: createUUID(),
		path,
		type: PLAIN_TEXT_FACADE_TYPE,
		properties: {},
		children: [],
		bubbleEvent,
		text,
		widgetFacadeMap,
		frameFacade,
		widgetFacadeCreator,
	});
}
