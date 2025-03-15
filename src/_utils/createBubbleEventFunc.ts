import { BubbleEventFunc, IBaseFacade, IFrameFacade, Path } from 'types';

export default function createBubbleEventFunc(
	frameFacade: IFrameFacade
): BubbleEventFunc {
	return (path, action) => {
		const callStack = createCallstack(frameFacade, path);

		while (callStack.length) {
			const currentWidget = callStack.pop();
			currentWidget._handleAction(action);

			if (action.stopped) {
				frameFacade._handleAction(action);
			}
		}
	};
}

export function createCallstack(
	frameFacade: IFrameFacade,
	path: Path
): [IFrameFacade, ...IBaseFacade[]] {
	return path.reduce<[IFrameFacade, ...IBaseFacade[]]>(
		(acc, pathIndex, index) => {
			const isLastPathIndex = index === path.length - 1;
			if (!isLastPathIndex) {
				const parent = acc.at(-1);
				acc.push(parent.children[pathIndex]);
			}

			return acc;
		},
		[frameFacade]
	);
}
