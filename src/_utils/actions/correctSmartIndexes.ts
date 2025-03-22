import { IBaseFacade, Index, SmartPath } from 'types';

export default function correctSmartIndexes(
	children: IBaseFacade[],
	startOfNewIndex: Index
): void {
	children.forEach((child, i) => {
		const childLevel = child.path.length - 1;
		const currentSmartIndex = child.smartPath[childLevel];
		currentSmartIndex.splice(0, 1, startOfNewIndex + i);
	});
}

export function correctSmartIndexesByTarget(
	target: IBaseFacade,
	children: IBaseFacade[]
): void {
	const parentPath = target.smartPath.slice(0, -1);
	const indexAfterTarget = target.path.at(-1) + 1;

	children.forEach((child, i) => {
		child.smartPath = [...parentPath, [indexAfterTarget + i]];
	});
}

export function correctParentInChildren(
	parent: IBaseFacade,
	children: IBaseFacade[]
): void {
	children.forEach((child) => {
		const newSmartPath: SmartPath = [
			...parent.smartPath,
			child.smartPath.at(-1),
		];
		child.smartPath = newSmartPath;

		if (child.children.length) {
			correctParentInChildren(child, child.children);
		}
	});
}
