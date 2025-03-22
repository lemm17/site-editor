import { getTextNode, getTextNodes, isTextNode } from './textNodes';

export function getRange(): Range | null {
	const selection = window.getSelection();
	if (!selection.rangeCount) {
		return null;
	}

	return selection.getRangeAt(selection.rangeCount - 1).cloneRange();
}

export function getCorrectTextNode(node: Node): Node {
	if (!isTextNode(node) && node.textContent === '\u200b') {
		return getTextNode(node as HTMLElement, 'start');
	}

	return node;
}

export function isForwardSelectionByRange(): boolean | never {
	const selection = document.getSelection();
	if (!selection.rangeCount) {
		throw new Error('There are no any range in selcetion');
	}

	if (selection.focusNode === selection.anchorNode) {
		// Если общий контейнер - текст, значит выделение находится внутри одной текстовой ноды,
		// а значит, направление определяется по оффсету
		return selection.anchorOffset < selection.focusOffset;
	}

	const commonAncestorContainer =
		selection.getRangeAt(0).commonAncestorContainer;

	// Иначе определяем по индексу узлов
	const allTextNodesInsideCommonAncestorContainer = getTextNodes(
		commonAncestorContainer as HTMLElement
	);

	const indexOfFocusContainer =
		allTextNodesInsideCommonAncestorContainer.findIndex(
			// Частный случай
			// Костыль
			(x) => x === getCorrectTextNode(selection.focusNode)
		);

	const indexOfAnchorContainer =
		allTextNodesInsideCommonAncestorContainer.findIndex(
			(x) => x === selection.anchorNode
		);

	return indexOfAnchorContainer < indexOfFocusContainer;
}
