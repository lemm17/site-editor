import { INLINE_WIDGET_OFFSET_LENGTH, ITextWidgetFacade } from 'types';
import isPlainTextFacade from './plainTextActions/isPlainTextFacade';

export default function computeTextLength(
	textFacade: ITextWidgetFacade
): number {
	return textFacade.children.reduce<number>((acc, child) => {
		if (isPlainTextFacade(child)) {
			return acc + child.text.length;
		}

		return acc + INLINE_WIDGET_OFFSET_LENGTH;
	}, 0);
}
