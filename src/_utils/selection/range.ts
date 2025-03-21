import { getTextNodes, isTextNode } from './textNodes';

export function getRange(): Range | null {
	const selection = window.getSelection();
	if (!selection.rangeCount) {
		return null;
	}

	return selection.getRangeAt(selection.rangeCount - 1).cloneRange();
}

export function isForwardSelectionByRange(
	range: Range = getRange()
): boolean | never {
	if (!range) {
		throw new Error('There are no any range in selcetion');
	}

	if (isTextNode(range.commonAncestorContainer)) {
		// Если общий контейнер - текст, значит выделение находится внутри одной текстовой ноды,
		// а значит, направление определяется по оффсету
		return range.startOffset < range.endOffset;
	}

	// Иначе определяем по индексу узлов
	const allTextNodesInsideCommonAncestorContainer = getTextNodes(
		range.commonAncestorContainer as HTMLElement
	);

	const indexOfStartContainer =
		allTextNodesInsideCommonAncestorContainer.findIndex(
			(x) => x === range.startContainer
		);

	const indexOfEndContainer =
		allTextNodesInsideCommonAncestorContainer.findIndex(
			(x) => x === range.endContainer
		);

	return indexOfStartContainer < indexOfEndContainer;
}
