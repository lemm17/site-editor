import { BubbleEventFunc, IBaseFacade, IFrameFacade } from 'types';

export default function createBubbleEventFunc(
	frameFacade: IFrameFacade
): BubbleEventFunc {
	return (path, action) => {
		const callStack = path.reduce<[IFrameFacade, ...IBaseFacade[]]>(
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

		while (callStack.length) {
			const currentWidget = callStack.pop();
			currentWidget._handleAction(action);

			if (action.stopped) {
				frameFacade._handleAction(action);
			}
		}
	};
}
