import { IDirection, ISelection, ITextWidgetComponentProps } from 'types';
import { children } from 'solid-js';
import { useFocus, useLeaveFocus, useCursorOffset } from 'hook';
import {
	applySelection,
	shouldLetOutCursor,
	computeSelection as computeSelectionInner,
} from 'utils';
import { keyboardKeyToDirectionMap, resetOffsetKeys } from './Text/constants';
import {
	handleExtremeCaseOnArrowKeyDown,
	handleExtremeCaseOnInsertText,
	isAllowedInputType,
} from './Text/helpers';

export interface ITextProps {}

export default function Text(props: ITextWidgetComponentProps<ITextProps>) {
	const resolvedChildren = children(() => props.children);
	let ref: HTMLParagraphElement;

	useFocus(props.value, (selection) => {
		applySelection(ref, selection);
	});
	const leaveFocus = useLeaveFocus(props.value);
	const [computeOffset, resetOffset] = useCursorOffset();

	/**
	 * Создаем замыкание для использования selection вычисленного
	 * в onBeforeInput в onInput.
	 *
	 * Вычислять selection нужно именно в beforeInput, потому что после мутации DOM
	 * selection станет неактуальным для операции.
	 *
	 * Выполнять action нужно именно в onInput, потому что изменение детей виджета текста через
	 * сеттер сигнала solid-js вызовет синхронную мутацию в DOM до самого ввода
	 *
	 */
	const [onBeforeInput, onInput] = (() => {
		// Создаем замыкание для использования selection вычисленного
		// в onBeforeInput в onInput.
		// Вычислять нужно именно в beforeInput, потому что после мутации DOM
		// selection станет неактуальным для операции.

		let selection: ISelection = null;

		const onBeforeInputInner = (e: InputEvent) => {
			if (!isAllowedInputType(e.inputType)) {
				e.preventDefault();

				selection = null;
			} else {
				selection = computeSelection();

				handleExtremeCaseOnInsertText(e, selection, props.value, () => {
					/**
					 * В таком кейсе коллбек вызовется если хэлпер запревентит событие.
					 * Если это произойдет, onInput не вызовется, а значит, изменения
					 * пролетят мимо фасада. Приходится вызывать здесь.
					 * Вызов здесь безопасен, поскольку хэндлер уже внес изменения в DOM
					 */

					if (e.inputType === 'insertText') {
						props.value.input({
							type: 'insertText',
							text: e.data,
							timeStamp: e.timeStamp,
							selection,
						});
					}
				});
			}

			resetOffset();
		};

		const onInputInner = (e: InputEvent) => {
			if (isAllowedInputType(e.inputType)) {
				props.value.input({
					type: e.inputType,
					text: e.data,
					timeStamp: e.timeStamp,
					selection,
				});
			}
		};

		return [onBeforeInputInner, onInputInner];
	})();

	const computeSelection = (direction: IDirection = null) => {
		return computeSelectionInner(props.value, ref, direction);
	};

	const onKeyDown = (e: KeyboardEvent) => {
		const key = e.key;

		if (key in keyboardKeyToDirectionMap) {
			const direction = keyboardKeyToDirectionMap[key] as IDirection;
			let selection = computeSelection(direction);

			if (shouldLetOutCursor(e, ref)) {
				e.preventDefault();

				// Проставляем общий offset, а не вычесленный налету ранее
				const offset = computeOffset();
				selection = {
					...selection,
					offset,
				};

				leaveFocus(selection);
			}

			// Обработка крайнего случая. См описание функции
			handleExtremeCaseOnArrowKeyDown(e, selection, props.value, ref);
		}

		if (resetOffsetKeys.includes(key)) {
			resetOffset();
		}
	};

	return (
		<p
			ref={ref}
			onKeyDown={onKeyDown}
			contentEditable={true}
			onBeforeInput={onBeforeInput}
			onInput={onInput}
		>
			{resolvedChildren()}
		</p>
	);
}
