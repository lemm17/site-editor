export function getTextNodes(parentNode: HTMLElement): Text[] {
	const textNodes: Text[] = [];

	function traverse(node: Node) {
		if (node.nodeType === Node.TEXT_NODE) {
			textNodes.push(node as Text);
		} else {
			node.childNodes.forEach(traverse);
		}
	}

	traverse(parentNode);
	return textNodes;
}

export function getTextNode(
	element: HTMLElement,
	from: 'left' | 'right'
): Text | Node {
	const accesorName = from === 'left' ? 'firstChild' : 'lastChild';
	let current = element as Node;

	while (current[accesorName]) {
		current = current[accesorName];

		if (isTextNode(current)) {
			return current as Text;
		}
	}

	return current;
}

export function isTextNode(node: HTMLElement | Node): node is Text {
	return node.nodeType === Node.TEXT_NODE;
}

export function getSiblingTextNode(
	targetNode: Node,
	isNextSibling: boolean
): Text | Node {
	let currentNode = targetNode;
	while (
		isNextSibling ? !currentNode.nextSibling : !currentNode.previousSibling
	) {
		currentNode = currentNode.parentElement;
	}
	let resultNode = isNextSibling
		? currentNode.nextSibling
		: currentNode.previousSibling;

	// Случай когда натыкаемся на инлайн-виджет (нужно искать текст и форматированный текст)
	if ('isContentEditable' in resultNode && !resultNode.isContentEditable) {
		resultNode = isNextSibling
			? resultNode.nextSibling
			: resultNode.previousSibling;
	}

	if (isTextNode(resultNode)) {
		return resultNode as Text;
	}

	return getTextNode(
		resultNode as HTMLElement,
		isNextSibling ? 'left' : 'right'
	);
}

export function getDeepestElement(
	node: HTMLElement,
	from: 'left' | 'right'
): HTMLElement {
	const textNode = getTextNode(node, from);

	if (isTextNode(textNode)) {
		return textNode.parentElement;
	}

	return textNode as HTMLElement;
}

export function getParentIfText(node: HTMLElement | Text): HTMLElement {
	return isTextNode(node) ? node.parentElement : node;
}
