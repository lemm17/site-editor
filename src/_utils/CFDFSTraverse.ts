import { IBaseFacade, IFacade, IFrameFacade, Index } from 'types';

type ShouldStop = boolean;

/**
 * Child First Death First Search Traverse
 * Обход дерева от конкретного элемента вправо и влево по приципу DIP (в глубину),
 * но дочерние элементы обрабатываются первыми.
 * Есть возможность досрочно закончить выполнение.
 */
export default function CFDFSTraverse(
	target: IBaseFacade,
	direction: 'left' | 'right',
	handler: (regular: IBaseFacade | IFrameFacade) => ShouldStop
): void {
	const root = target.frameFacade;
	const stack: [IFrameFacade, ...IBaseFacade[]] = [root];
	const parentPathAsStack = target.path.slice(0, -1).reverse();

	let current: IFrameFacade | IBaseFacade = root;
	while (parentPathAsStack.length) {
		current = current.children[parentPathAsStack.pop()];
		stack.push(current);
	}

	traverseFromNode(target, stack, direction, handler);
}

function traverseFromNode<T extends IFacade<T>>(
	startNode: IBaseFacade,
	stack: [IFrameFacade, ...IBaseFacade[]],
	direction: 'left' | 'right',
	handler: (regular: IBaseFacade | IFrameFacade) => ShouldStop
) {
	let current: IBaseFacade | IFrameFacade = startNode;
	const isLeftDirection = direction === 'left';
	const isRightDirection = direction === 'right';
	// Стартовую обрабатывать не нужно, от нее начинаем идти вправо/влево
	// Заводим флаг для обработки
	let ignore = true;

	while (current || stack.length > 0) {
		if (!ignore) {
			// 1. Спускаемся в самый глубокий узел в выбранном направлении
			while (current) {
				stack.push(current);
				current = isLeftDirection
					? current.children.at(-1)
					: current.children.at(0);
			}
		}

		if (ignore) {
			ignore = false;
		} else {
			// 2. Достаем последний узел из стека (самый глубокий в данном направлении)
			current = stack.pop();
			// Обрабатываем узел
			const result = handler(current);
			if (result || stack.length === 0) {
				return;
			}
		}

		const parentOfCurrent = stack.at(-1);
		const indexOfCurrent: Index = current.path.at(-1);
		const noLeft = isLeftDirection && indexOfCurrent === 0;
		const noRight =
			isRightDirection &&
			indexOfCurrent === parentOfCurrent.children.length - 1;

		if (noLeft || noRight) {
			// Если вбок дальше идти некуда, устанавливаем null для current,
			// чтобы брать следующий из стека
			current = null;
			continue;
		}

		// 3. Если есть сосед в противоположном направлении, идем в него и снова углубляемся
		current = isLeftDirection
			? parentOfCurrent.children.at(indexOfCurrent - 1)
			: parentOfCurrent.children.at(indexOfCurrent + 1);
	}
}
