import {
	ICaretPosition,
	ICursorInfo,
	ISelection,
	ITextWidgetFacade,
	SyntheticSelectionRects,
	SyntheticSelectionRowRect,
} from 'types';
import detection from '../detection';
import { computeOffsetByCaretPosition } from './computeSelection';
import { getRangeCoords } from './coords';
import isEmpty from './isEmpty';
import { default as isEqualSelection } from './isEqual';
import { getRange, isForwardSelection } from './range';
import {
	getCaretRectAtPosition,
	getCursorRect,
	getFirstNodeRect,
	getLastNodeRect,
} from './rect';
import { getSiblingTextNode, getTextNode } from './textNodes';

export function isEqualCaretPosition(
	a: ICaretPosition,
	b: ICaretPosition
): boolean {
	return a.node === b.node && a.offset === b.offset;
}

export function getCurrentCaretPosition(): ICaretPosition {
	const range = getRange();
	const isForward = isForwardSelection(range);

	if (isForward) {
		return {
			node: range.endContainer,
			offset: range.endOffset,
		};
	}

	return {
		node: range.startContainer,
		offset: range.startOffset,
	};
}

export function getCurrentAnchorCaretPosition(): ICaretPosition {
	const selection = document.getSelection();

	return {
		node: selection.anchorNode,
		offset: selection.anchorOffset,
	};
}

export function getInitialCaretPosition(
	target: HTMLElement,
	from: 'start' | 'end',
	withRect: boolean = false
): ICaretPosition {
	const node = getTextNode(target, from);
	const offset = from === 'end' ? node.textContent.length : 0;

	if (withRect) {
		return {
			node,
			offset,
			rect: getCaretRectAtPosition({ node, offset }),
		};
	}

	return {
		node,
		offset,
	};
}

export function setCaret(
	target: HTMLElement,
	anchorCaretPosition: ICaretPosition,
	focusCaretPosition: ICaretPosition
): void {
	// В safari перед изменением выделения нужно активировать контейнер,
	// где находится нода из выделения
	if (detection.safari) {
		target.focus();
	}

	const selection = window.getSelection();
	selection.setBaseAndExtent(
		anchorCaretPosition.node,
		anchorCaretPosition.offset,
		focusCaretPosition.node,
		focusCaretPosition.offset
	);

	if (!detection.safari) {
		// Исправляет ошибку:
		// https://online.sbis.ru/opendoc.html?guid=905254c4-95bf-40c1-a2ae-fbda8de93710&client=3
		focusCaretPosition.node.parentElement?.focus();
	}
}

export function getCaretPosition<Params extends Array<unknown>>(
	target: HTMLElement,
	startSearchFrom: 'start' | 'end',
	searcher: CaretSearcher<Params>,
	...searcherParams: Params
): ICaretPosition {
	const initialCaretPosition = getInitialCaretPosition(
		target,
		startSearchFrom
	);
	const extremeCaretPosition = getInitialCaretPosition(
		target,
		startSearchFrom === 'end' ? 'start' : 'end'
	);
	const searchConfiguration: SearchConfiguration = {
		startSearchFrom,
		initialCaretPosition,
		extremeCaretPosition,
	};

	return searcher(searchConfiguration, ...searcherParams);
}

interface SearchConfiguration {
	initialCaretPosition: ICaretPosition;
	extremeCaretPosition: ICaretPosition;
	startSearchFrom: 'start' | 'end';
}

export default function getCaretInfo(target: HTMLElement): ICursorInfo {
	const selection = document.getSelection();
	let cursorRect = getCursorRect(getRange(), selection) ?? [];

	if (!cursorRect) {
		return null;
	}

	cursorRect = cursorRect as Omit<DOMRect, 'toJSON'>;
	const offset = cursorRect.left;
	const firstNodeRect = getFirstNodeRect(target);
	const lastNodeRect = getLastNodeRect(target);
	const isEmptyWidget = isEmpty(target);

	const isCursorOnFirstLine = checkCursorOnFirstLine(
		firstNodeRect,
		cursorRect,
		isEmptyWidget
	);
	const isCursorOnLastLine = checkCursorOnLastLine(
		lastNodeRect,
		cursorRect,
		isEmptyWidget
	);
	const isCursorOnStart = checkCursorOnStart(target);
	const isCursorOnEnd = checkCursorOnEnd(target);
	const isCollapsed = getRange().collapsed;
	const rangeCoords = getRangeCoords();

	return {
		isCursorOnFirstLine,
		isCursorOnLastLine,
		isCursorOnStart,
		isCursorOnEnd,
		offset,
		isCollapsed,
		rangeCoords,
	};
}

function checkCursorOnFirstLine(
	firstNodeRect: DOMRect,
	cursorRect: Partial<DOMRect>,
	isEmptyWidget?: boolean
): boolean {
	return (
		cursorRect.top - cursorRect.height < firstNodeRect.top || isEmptyWidget
	);
}

function checkCursorOnLastLine(
	lastNodeRect: DOMRect,
	cursorRect: Partial<DOMRect>,
	isEmptyWidget?: boolean
): boolean {
	return (
		cursorRect.bottom + cursorRect.height > lastNodeRect.bottom ||
		isEmptyWidget
	);
}

function checkCursorOnStart(target: HTMLElement): boolean {
	const startCaretPosition = getInitialCaretPosition(target, 'start');
	const currentCaretPosition = getCurrentCaretPosition();

	// Особый случай. Почему-то, если выходить стрелкой влево из
	// текста с инлайн-виджетом на первом месте, в anchorNode
	// и focusNode записывается корень текстового виджета - p.
	// Если выходить вправо, когда инлайн-виджет в конце,
	// такого эффекта не наблюдается.
	if (
		currentCaretPosition.node === target &&
		currentCaretPosition.offset === 0
	) {
		return true;
	}

	return isEqualCaretPosition(startCaretPosition, currentCaretPosition);
}

function checkCursorOnEnd(target: HTMLElement): boolean {
	const endCaretPosition = getInitialCaretPosition(target, 'end');
	const currentCaretPosition = getCurrentCaretPosition();

	return isEqualCaretPosition(endCaretPosition, currentCaretPosition);
}

type CaretSearcher<Params extends Array<unknown>> = (
	searchConfiguration: SearchConfiguration,
	...args: Params
) => ICaretPosition;

export const searchCaretPositionByOffset: CaretSearcher<[number]> = (
	searchConfiguration,
	targetCaretOffset
) => {
	const { initialCaretPosition, extremeCaretPosition, startSearchFrom } =
		searchConfiguration;
	const toRight = startSearchFrom === 'start';

	// Rect начальной позиции каретки
	const initialCaretRect = getCaretRectAtPosition(initialCaretPosition);

	// Предыдущий оффсет каретки в пикселях
	let prevOffsetX: number;

	// Текущая позиция каретки
	let caretPosition: ICaretPosition = {
		...initialCaretPosition,
		rect: initialCaretRect,
	};

	// Оставливаем поиск каретки, когда смещение каретки заходит за targetCaretOffset
	while (
		toRight
			? caretPosition.rect.x < targetCaretOffset
			: caretPosition.rect.x > targetCaretOffset
	) {
		// Обновляем предыдущий оффсет каретки
		prevOffsetX = caretPosition.rect.x;

		// Делаем шаг поиска каретки
		caretPosition = searchCaretPositionStep(caretPosition, toRight);
		const haveReachedEdge = isEqualCaretPosition(
			caretPosition,
			extremeCaretPosition
		);

		if (haveReachedEdge) {
			break;
		}

		const haveMovedOnNextLine = toRight
			? caretPosition.rect.y > initialCaretRect.y + initialCaretRect.height
			: caretPosition.rect.y < initialCaretRect.y;
		// Если каретка оказалась на следующей строке, делаем шаг назад и останавливаем поиск
		if (haveMovedOnNextLine) {
			caretPosition = searchCaretPositionStep(caretPosition, !toRight);
			break;
		}
	}

	// Если предыдущая позиция каретки была ближе к targetCaretOffset, делаем шаг назад
	const isPrevCharOffsetCloser =
		prevOffsetX &&
		Math.abs(prevOffsetX - targetCaretOffset) <
			Math.abs(caretPosition.rect.x - targetCaretOffset);
	if (isPrevCharOffsetCloser) {
		caretPosition = searchCaretPositionStep(caretPosition, !toRight);
	}

	return caretPosition;
};

function prepareSelectionRowRect(rowRect: {
	left: number;
	top: number;
	height: number;
	width: number;
}): SyntheticSelectionRowRect {
	return {
		left: `${rowRect.left}px`,
		top: `${rowRect.top}px`,
		width: `${rowRect.width}px`,
		height: `${rowRect.height}px`,
	};
}

export function computeSyntheticSelectionRects(
	target: HTMLElement,
	startCaretPosition: ICaretPosition,
	endCaretPosition: ICaretPosition
): SyntheticSelectionRects {
	const selectionRects: SyntheticSelectionRects = [];
	const targetRect = target.getBoundingClientRect();

	const rectOfStart = getCaretRectAtPosition(startCaretPosition);
	let caretPosition = startCaretPosition;
	let currentRowRect = {
		left: rectOfStart.left - targetRect.left,
		top: rectOfStart.top - targetRect.top,
		height: rectOfStart.height,
		width: 0,
	};
	while (true) {
		const newCaretPosition = searchCaretPositionStep(caretPosition, true);
		const haveReachedEdge = isEqualCaretPosition(
			newCaretPosition,
			endCaretPosition
		);

		const haveMovedOnNextLine =
			newCaretPosition.rect.y >
			caretPosition.rect.y + caretPosition.rect.height;

		if (haveMovedOnNextLine || haveReachedEdge) {
			const caretForWidthComputing = haveMovedOnNextLine
				? caretPosition
				: newCaretPosition;
			const currentRowWidth =
				caretForWidthComputing.rect.right -
				targetRect.left -
				currentRowRect.left;

			currentRowRect.width = currentRowWidth;

			selectionRects.push(prepareSelectionRowRect(currentRowRect));

			if (haveReachedEdge) {
				break;
			}

			currentRowRect = {
				left: caretPosition.rect.left - targetRect.left,
				top: caretPosition.rect.top - targetRect.top,
				height: caretPosition.rect.height,
				width: 0,
			};
		}

		caretPosition = newCaretPosition;
	}

	return selectionRects;
}

export const searchCaretPositionByTextOffset: CaretSearcher<
	[number, ITextWidgetFacade]
> = (searchConfiguration, textOffset, textFacade) => {
	const { initialCaretPosition, extremeCaretPosition, startSearchFrom } =
		searchConfiguration;
	const toRight = startSearchFrom === 'start';

	let caretPosition = initialCaretPosition;
	while (true) {
		const caretPositionOffset = computeOffsetByCaretPosition(
			caretPosition,
			textFacade
		);

		if (caretPositionOffset === textOffset) {
			break;
		}

		// Делаем шаг поиска каретки
		caretPosition = searchCaretPositionStep(caretPosition, toRight);
		const haveReachedEdge = isEqualCaretPosition(
			caretPosition,
			extremeCaretPosition
		);

		if (haveReachedEdge) {
			break;
		}
	}

	return caretPosition;
};

const MIN_CHAR_OFFSET = 0;

function searchCaretPositionStep(
	caretPosition: ICaretPosition,
	toRight: boolean,
	searchSibling: boolean = true
): ICaretPosition {
	// Шаг поиска каретки
	const charStep = toRight ? 1 : -1;

	// Текущая позиция каретки
	let { node, offset } = caretPosition;

	// Максимальная позиция каретки в DOM элементе равна длине текста
	let maxCharOffset = node.textContent.length;

	// Увеличиваем текущее смещение каретки на шаг поиска
	offset += charStep;

	// Проверяем, выходит ли смещение каретки за границы текущего DOM элемента
	if (offset > maxCharOffset || offset < MIN_CHAR_OFFSET) {
		if (searchSibling) {
			// Находим следующий соседний элемент
			node = getSiblingTextNode(node, toRight);

			// Обновляем максимальную позицию каретки
			maxCharOffset = node.textContent.length;

			// В зависимости от направления поиска, ставим каретку в начало или конец элемента
			offset = toRight ? MIN_CHAR_OFFSET : maxCharOffset;
		} else {
			offset -= charStep;
		}
	}

	// Rect каретки в новой позиции
	const caretRect = getCaretRectAtPosition({ node, offset });

	return { node, offset, rect: caretRect };
}
