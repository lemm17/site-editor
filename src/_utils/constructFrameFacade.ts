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
} from 'types';
import { PlainTextFacade } from 'entities';

export function createWidgetFacadeConstructor(
	bubbleEvent: BubbleEventFunc,
	facadeMap: Record<WIDGETS, IWidgetFacadeConstructor>
): WidgetFacadeConstructor {
	const constructWidgetFacade = (
		widget: IWidget,
		path: SmartPath,
		parent: IWidget
	): IBaseFacade => {
		const isParentTextWidget = parent && Frame.isTextWidget(parent);
		if (isParentTextWidget && typeof widget === 'string') {
			return new PlainTextFacade({
				id: createUUID(),
				path,
				type: PLAIN_TEXT_FACADE_TYPE,
				properties: {},
				children: [],
				bubbleEvent,
				text: widget,
			});
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
		const Facade = facadeMap[WIDGETS[name]] as IWidgetFacadeConstructor;

		return new Facade({
			id: createUUID(),
			path,
			type: WIDGETS[name],
			properties: props,
			children: childrenFacades,
			bubbleEvent,
		});
	};

	return constructWidgetFacade;
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
