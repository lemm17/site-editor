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
import { isForwardSelectionByRange, getRange } from './range';
import { getCoords } from './coords';
import { getParentIfText } from './textNodes';
import {
	getCaretPosition,
	getCurrentAnchorCaretPosition,
	searchCaretPositionByOffset,
} from './caret';
import isRightTextPathOf from '../isRightTextPathOf';

/**
 * Перед вызовом функции необходимо убедиться, что selection
 * установлен в компонент виджета, иначе может быть ошибка.
 */
export default function computeSelection(
	textFacade: ITextWidgetFacade,
	focusDirection: IDirection = null,
	offset: number = computeOffset()
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
	let anchorOffset = 0;
	let focusOffset = 0;
	for (const child of textFacade.children) {
		if (focusFinish && anchorFinish) {
			break;
		}

		if (child.type !== PLAIN_TEXT_FACADE_TYPE) {
			if (!anchorFinish) {
				anchorOffset += INLINE_WIDGET_OFFSET_LENGTH;
			}

			if (!focusFinish) {
				focusOffset += INLINE_WIDGET_OFFSET_LENGTH;
			}

			continue;
		}

		if (!focusFinish) {
			if (focusId === child.id) {
				if (selection.focusNode.textContent !== '\u200b') {
					// Игнорируем смещение пустого символа, его нет в данных
					focusOffset += selection.focusOffset;
				} else if (selection.focusNode.textContent.length > 1) {
					throw new Error('hueta kakayato');
				}

				focusFinish = true;
			} else {
				focusOffset += (child as IPlainTextFacade).text.length;
			}
		}

		if (!anchorFinish) {
			if (anchorId === child.id) {
				if (selection.anchorNode.textContent !== '\u200b') {
					// Игнорируем смещение пустого символа, его нет в данных
					anchorOffset += selection.anchorOffset;
				} else if (selection.anchorNode.textContent.length > 1) {
					throw new Error('hueta kakayato');
				}

				anchorFinish = true;
			} else {
				anchorOffset += (child as IPlainTextFacade).text.length;
			}
		}
	}

	let computedFocusDirection = focusDirection;
	if (!computedFocusDirection) {
		if (textFacade.frameFacade.anchorPoint) {
			const isAnchorToTheLeft = isRightTextPathOf(
				textFacade.path,
				textFacade.frameFacade.anchorPoint.anchorText.path
			);

			computedFocusDirection = isAnchorToTheLeft ? 'down' : 'up';
		} else {
			computedFocusDirection = focusOffset > anchorOffset ? 'right' : 'left';
		}
	}

	return {
		anchorText: textFacade,
		focusText: textFacade,
		anchorOffset,
		focusOffset,
		focusDirection: computedFocusDirection,
		offsetX: offset,
		// null or anchorText & anchorOffset
		...textFacade.frameFacade.anchorPoint,
	};
}

export function computeOffset(range: Range = getRange()): number {
	return getCoords(range, !isForwardSelectionByRange()).x;
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
	focusDirection: IDirection
): number {
	const startSearchFrom = focusDirection === 'up' ? 'end' : 'start';

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
