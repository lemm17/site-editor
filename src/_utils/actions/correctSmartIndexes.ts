import { IBaseFacade, Index, SmartIndex, SmartPath } from 'types';

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

export function correctParentIndex(
	children: IBaseFacade[],
	parentSmartIndex: SmartIndex
): void {
	const parentLevelInTree = children[0].path.length - 2;
	const correctParentIndexRecursive = (children: IBaseFacade[]): void => {
		children.forEach((child) => {
			const newSmartPath: SmartPath = [
				...child.smartPath.slice(0, parentLevelInTree),
				parentSmartIndex,
				...child.smartPath.slice(parentLevelInTree + 1),
			];
			child.smartPath = newSmartPath;

			if (child.children.length) {
				correctParentIndexRecursive(child.children);
			}
		});
	};

	correctParentIndexRecursive(children);
}
