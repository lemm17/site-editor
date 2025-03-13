import { IBaseFacade, Index } from 'types';

export default function correctChildIndexes(
	children: IBaseFacade[],
	startOfNewIndex: Index
): void {
	children.forEach((child, i) => {
		const childLevel = child.path.length - 1;
		const currentSmartIndex = child.smartPath[childLevel];
		currentSmartIndex.splice(0, 1, startOfNewIndex + i);
	});
}
