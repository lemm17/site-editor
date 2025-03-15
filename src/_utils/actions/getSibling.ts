import { IBaseFacade, IWidgetFacade } from 'types';

export default function getSibling(
	target: IBaseFacade,
	parent: IWidgetFacade,
	next: boolean = true
): IBaseFacade | null {
	const last = !next;
	const indexOfTarget = target.path.at(-1);
	const isFirstChild = indexOfTarget === 0;
	const isLastChild = indexOfTarget === parent.children.length - 1;

	if ((isFirstChild && last) || (isLastChild && next)) {
		// Соседа нет
		return null;
	}

	const modifier = next ? 1 : -1;
	return parent.children.at(indexOfTarget + modifier);
}
