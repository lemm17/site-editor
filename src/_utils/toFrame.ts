import { PlainTextFacade } from 'entities';
import {
	IBaseFacade,
	IFrame,
	IFrameFacade,
	IProperties,
	IWidget,
	IWidgetChild,
	IWidgetFacade,
	PLAIN_TEXT_FACADE_TYPE,
} from 'types';

const isEmpty = (obj: object) => Object.keys(obj).length === 0;

export function widgetToFrame<Properties extends IProperties = {}>(
	baseFacade: IBaseFacade<Properties>,
	withPath: boolean = false
): IWidget<Properties> | string {
	if (baseFacade instanceof PlainTextFacade) {
		const plainText = baseFacade.text === '\u200b' ? '' : baseFacade.text;
		if (withPath) {
			// path нет в понятии атрибутов виджетов, поэтому костылим типы
			return [
				PLAIN_TEXT_FACADE_TYPE,
				{ path: baseFacade.path.join(' ') },
				plainText,
			] as unknown as string;
		}
		return plainText;
	}
	const widgetFacade = baseFacade as unknown as IWidgetFacade;
	const props = widgetFacade.properties;

	const childrensAsFrame = widgetFacade.children.map((child) => {
		return widgetToFrame(child as IWidgetFacade, withPath);
	});

	if (isEmpty(props) && !withPath) {
		return [
			widgetFacade.type,
			childrensAsFrame[0] as IWidgetChild,
			...(childrensAsFrame.slice(1) as IWidgetChild[]),
		];
	}

	if (withPath) {
		return [
			widgetFacade.type,
			{ ...props, path: widgetFacade.path.join(' ') },
			...childrensAsFrame,
		] as IWidget<Properties>;
	}

	return [
		widgetFacade.type,
		props,
		...childrensAsFrame,
	] as IWidget<Properties>;
}

export default function toFrame(
	frameFacade: IFrameFacade,
	withPath: boolean = false
): IFrame {
	return [
		'frame',
		{},
		...(frameFacade.children.map((child) =>
			widgetToFrame(child, withPath)
		) as IWidget[]),
	];
}
