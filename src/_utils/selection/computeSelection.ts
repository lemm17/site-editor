import {
	IAnchorPoint,
	ICaretPosition,
	IDirection,
	IFocusPoint,
	INLINE_WIDGET_OFFSET_LENGTH,
	IPlainTextFacade,
	ISelection,
	ITextWidgetFacade,
	PLAIN_TEXT_FACADE_TYPE,
} from 'types';
import { isForwardSelection, getRange } from './range';
import { getCoords } from './coords';
import { getParentIfText } from './textNodes';
import {
	getCaretPosition,
	getCurrentAnchorCaretPosition,
	searchCaretPositionByOffset,
} from './caret';

/**
 * Перед вызовом функции необходимо убедиться, что selection
 * установлен в компонент виджета, иначе может быть ошибка.
 */
export default function computeSelection(
	textFacade: ITextWidgetFacade,
	target: HTMLElement,
	direction: IDirection = null,
	offset: number = computeOffset(getRange())
): ISelection | never {
	const selection = document.getSelection();
	const range = getRange();

	if (!range) {
		throw new Error('There are no any ranges in selection');
	}

	if (!selection.focusNode) {
		throw new Error(
			"There are no focus node in selection. Text selection doesn't installed"
		);
	}

	if (!selection.anchorNode) {
		throw new Error(
			"There are no anchor node in selection. Text selection doesn't installed"
		);
	}

	const focusElement = getParentIfText(selection.focusNode as HTMLElement);
	const anchorElement = getParentIfText(selection.anchorNode as HTMLElement);

	if (
		selection.isCollapsed &&
		focusElement === target &&
		selection.focusOffset === 0
	) {
		// Особый случай. Почему-то, если выходить стрелкой влево из
		// текста с инлайн-виджетом на первом месте, в anchorNode
		// и focusNode записывается корень текстового виджета - p.
		// Если выходить вправо, когда инлайн-виджет в конце,
		// такого эффекта не наблюдается.
		return {
			anchor: 0,
			focus: 0,
			direction,
			offset,
		};
	}

	const focusId = focusElement?.id;
	if (!focusId) {
		throw new Error(
			`Didn't find id on focus plain text element ${focusElement}`
		);
	}

	const anchorId = anchorElement?.id;
	if (!anchorId) {
		throw new Error(
			`Didn't find id on anchor plain text element ${anchorElement}`
		);
	}

	let anchorFinish = false;
	let focusFinish = false;
	let anchor = 0;
	let focus = 0;
	for (const child of textFacade.children) {
		if (focusFinish && anchorFinish) {
			break;
		}

		if (child.type !== PLAIN_TEXT_FACADE_TYPE) {
			if (!anchorFinish) {
				anchor += INLINE_WIDGET_OFFSET_LENGTH;
			}

			if (!focusFinish) {
				focus += INLINE_WIDGET_OFFSET_LENGTH;
			}

			continue;
		}

		if (!focusFinish) {
			if (focusId === child.id) {
				if (selection.focusNode.textContent !== '\u200b') {
					// Игнорируем смещение пустого символа, его нет в данных
					focus += selection.focusOffset;
				} else if (selection.focusNode.textContent.length > 1) {
					throw new Error('hueta kakayato');
				}

				focusFinish = true;
			} else {
				focus += (child as IPlainTextFacade).text.length;
			}
		}

		if (!anchorFinish) {
			if (anchorId === child.id) {
				if (selection.anchorNode.textContent !== '\u200b') {
					// Игнорируем смещение пустого символа, его нет в данных
					anchor += selection.anchorOffset;
				} else if (selection.anchorNode.textContent.length > 1) {
					throw new Error('hueta kakayato');
				}

				anchorFinish = true;
			} else {
				anchor += (child as IPlainTextFacade).text.length;
			}
		}
	}

	return {
		anchor,
		focus,
		direction,
		offset,
	};
}

export function computeOffset(range: Range = getRange()): number {
	return getCoords(range, isForwardSelection(range)).x;
}

export function facadeContainsSelection(
	textFacade: ITextWidgetFacade
): boolean {
	const range = getRange();

	if (!range || !range.commonAncestorContainer) {
		return false;
	}

	let current = range.commonAncestorContainer.parentElement;
	while (current) {
		if (current.getAttribute('data-inline') === 'false') {
			return current.id === textFacade.id;
		}
		current = current.parentElement;
	}

	return false;
}

export function computeAnchorOffset(
	textFacade: ITextWidgetFacade
): IAnchorPoint['anchorOffset'] | null {
	if (!facadeContainsSelection(textFacade)) {
		return null;
	}

	const anchorCaretPosition = getCurrentAnchorCaretPosition();

	return computeOffsetByCaretPosition(
		anchorCaretPosition,
		textFacade
	) as IAnchorPoint['anchorOffset'];
}

export function computeTextOffsetByOffsetX(
	textFacade: ITextWidgetFacade,
	container: HTMLElement,
	offsetX: number,
	direction: IDirection
): number {
	const startSearchFrom = direction === 'up' ? 'end' : 'start';

	const caretPosition = getCaretPosition(
		container,
		startSearchFrom,
		searchCaretPositionByOffset,
		offsetX
	);

	return computeOffsetByCaretPosition(caretPosition, textFacade);
}

export function computeOffsetByCaretPosition(
	caretPosition: ICaretPosition,
	textFacade: ITextWidgetFacade
): number {
	const element = getParentIfText(caretPosition.node);
	const elementId = element?.id;
	if (!elementId) {
		throw new Error(`Didn't find id on plain text element ${element}`);
	}

	let textOffset = 0;
	for (const child of textFacade.children) {
		if (child.type !== PLAIN_TEXT_FACADE_TYPE) {
			textOffset += INLINE_WIDGET_OFFSET_LENGTH;
			continue;
		}

		if (elementId === child.id) {
			if (element.textContent !== '\u200b') {
				// Игнорируем смещение пустого символа, его нет в данных
				textOffset += caretPosition.offset;
			} else if (element.textContent.length > 1) {
				throw new Error('hueta kakayato');
			}

			break;
		} else {
			textOffset += (child as IPlainTextFacade).text.length;
		}
	}

	return textOffset;
}
