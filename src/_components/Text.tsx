import {
	IDirection,
	ISelection,
	ITextWidgetComponentProps,
	TEXT_WIDGET_CLASS_NAME,
} from 'types';
import { children, onMount, For } from 'solid-js';
import {
	useFocus,
	useLeaveFocus,
	useCursorOffset,
	useMouseLeave,
	useMouseEnter,
} from 'hook';
import {
	applySelection,
	shouldLetOutCursor,
	computeSelection,
	isCollapsed,
} from 'utils';
import { keyboardKeyToDirectionMap, resetOffsetKeys } from './Text/constants';
import { ignoreZeroWidthSpaceIfNeed, isAllowedInputType } from './Text/helpers';
import './Text/Text.css';

export interface ITextProps {}

export default function Text(props: ITextWidgetComponentProps) {
	const resolvedChildren = children(() => props.children);
	let ref: HTMLParagraphElement;

	const syntheticSelectionRects = useFocus(props.value, (selection) => {
		return applySelection(ref, props.value, selection);
	});
	const leaveFocus = useLeaveFocus(props.value);
	const [computeOffset, resetOffset] = useCursorOffset();
	const onMouseLeave = useMouseLeave(props.value);
	const onMouseEnter = useMouseEnter(props.value);

	const onBeforeInput = (e: InputEvent) => {
		e.preventDefault();
		resetOffset();

		if (!isAllowedInputType(e.inputType)) {
			return;
		}

		switch (e.inputType) {
			case 'insertText':
				onInsertText(e);
				return;
			case 'deleteContentBackward':
				onDeleteContent(e, true);
				return;
			case 'deleteContentForward':
				onDeleteContent(e, false);
				return;
			case 'insertParagraph':
				onInsertParagraph(e);
				return;
		}
	};

	const onInsertParagraph = (e: InputEvent): void => {
		const selectionBeforeInput = computeSelection(props.value, ref);

		props.value.input({
			type: 'insertParagraph',
			timeStamp: e.timeStamp,
			selection: selectionBeforeInput,
		});

		// Постановку курсора в новый параграф делигируем фрейм-фасаду
	};

	const onDeleteContent = (e: InputEvent, backward: boolean): void => {
		const forward = !backward;
		const selectionBeforeInput = computeSelection(props.value, ref);
		const currentLength = props.value.length;

		const shouldMergeContentBackward =
			backward &&
			selectionBeforeInput.anchorOffset === 0 &&
			selectionBeforeInput.focusOffset === 0;
		const shouldMergeContentForward =
			forward &&
			selectionBeforeInput.anchorOffset === currentLength &&
			selectionBeforeInput.focusOffset === currentLength;

		if (shouldMergeContentBackward) {
			props.value.input({
				type: 'mergeContentBackward',
				timeStamp: e.timeStamp,
				selection: selectionBeforeInput,
			});

			// Делигируем установку курсора в смерженном состоянии фрейм-фасаду
		} else if (shouldMergeContentForward) {
			props.value.input({
				type: 'mergeContentForward',
				timeStamp: e.timeStamp,
				selection: selectionBeforeInput,
			});

			// Делигируем установку курсора в смерженном состоянии фрейм-фасаду
		} else {
			const type = backward
				? 'deleteContentBackward'
				: 'deleteContentForward';
			props.value.input({
				type,
				timeStamp: e.timeStamp,
				selection: selectionBeforeInput,
			});

			const textOffsetModifier = backward ? -1 : 0;
			const textOffsetAfterInput = isCollapsed(selectionBeforeInput)
				? selectionBeforeInput.anchorOffset + textOffsetModifier
				: Math.min(
						selectionBeforeInput.anchorOffset,
						selectionBeforeInput.focusOffset
					);

			const selectionAfterInput = {
				anchorText: props.value,
				focusText: props.value,
				anchorOffset: textOffsetAfterInput,
				focusOffset: textOffsetAfterInput,
				direction: null,
				offset: null,
			};

			applySelection(ref, props.value, selectionAfterInput);
		}
	};

	const onInsertText = (e: InputEvent): void => {
		const selectionBeforeInput = computeSelection(props.value, ref);
		props.value.input({
			type: 'insertText',
			timeStamp: e.timeStamp,
			text: e.data,
			selection: selectionBeforeInput,
		});

		const textOffsetAfterInput =
			Math.min(
				selectionBeforeInput.anchorOffset,
				selectionBeforeInput.focusOffset
			) + 1;
		const selectionAfterInput: ISelection = {
			anchorText: props.value,
			focusText: props.value,
			anchorOffset: textOffsetAfterInput,
			focusOffset: textOffsetAfterInput,
			direction: null,
			offset: null,
		};
		applySelection(ref, props.value, selectionAfterInput);
	};

	const onKeyDown = (e: KeyboardEvent) => {
		ignoreZeroWidthSpaceIfNeed(e);

		if (e.key in keyboardKeyToDirectionMap) {
			const direction = keyboardKeyToDirectionMap[e.key] as IDirection;
			let selection = computeSelection(props.value, ref, direction);

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
		}

		if (resetOffsetKeys.includes(e.key)) {
			resetOffset();
		}
	};

	onMount(() => {
		props.value._setContainer(ref);
	});

	return (
		<div
			onKeyDown={onKeyDown}
			contentEditable={true}
			class={TEXT_WIDGET_CLASS_NAME}
			onBeforeInput={onBeforeInput}
			onMouseLeave={onMouseLeave}
			onMouseEnter={onMouseEnter}
		>
			<div class='syntetic-selection'>
				<For each={syntheticSelectionRects()}>
					{(selectionRect) => {
						return (
							<div
								class='syntetic-selection-row'
								style={selectionRect}
							/>
						);
					}}
				</For>
			</div>
			<p ref={ref}>{resolvedChildren()}</p>
		</div>
	);
}
