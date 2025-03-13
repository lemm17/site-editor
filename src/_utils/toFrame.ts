import { PlainTextFacade } from 'entities';
import {
	IBaseFacade,
	IFrame,
	IFrameFacade,
	IProperties,
	IWidget,
	IWidgetChild,
	IWidgetFacade,
} from 'types';

const isEmpty = (obj: object) => Object.keys(obj).length === 0;

export function widgetToFrame<Properties extends IProperties = {}>(
	baseFacade: IBaseFacade<Properties>
): IWidget<Properties> | string {
	if (baseFacade instanceof PlainTextFacade) {
		return baseFacade.text;
	}
	const widgetFacade = baseFacade as IWidgetFacade;
	const props = widgetFacade.properties;

	const childrensAsFrame = widgetFacade.children.map((child) => {
		if (child instanceof PlainTextFacade) {
			return child.text;
		}

		return widgetToFrame(child as IWidgetFacade);
	});

	if (isEmpty(props)) {
		return [
			widgetFacade.type,
			childrensAsFrame[0] as IWidgetChild,
			...(childrensAsFrame.slice(1) as IWidgetChild[]),
		];
	}

	return [
		widgetFacade.type,
		props,
		...childrensAsFrame,
	] as IWidget<Properties>;
}

export default function toFrame(frameFacade: IFrameFacade): IFrame {
	return [
		'frame',
		{},
		...(frameFacade.children.map((child) =>
			widgetToFrame(child)
		) as IWidget[]),
	];
}
