import {
	IDirection,
	ISelection,
	ITextWidgetComponentProps,
	TEXT_WIDGET_CLASS_NAME,
} from 'types';
import { children, onMount } from 'solid-js';
import { useFocus, useLeaveFocus, useCursorOffset } from 'hook';
import {
	applySelection,
	shouldLetOutCursor,
	computeSelection,
	isCollapsed,
} from 'utils';
import { keyboardKeyToDirectionMap, resetOffsetKeys } from './Text/constants';
import { ignoreZeroWidthSpaceIfNeed, isAllowedInputType } from './Text/helpers';

export interface ITextProps {}

export default function Text(props: ITextWidgetComponentProps) {
	const resolvedChildren = children(() => props.children);
	let ref: HTMLParagraphElement;

	useFocus(props.value, (selection) => {
		applySelection(ref, props.value, selection);
	});
	const leaveFocus = useLeaveFocus(props.value);
	const [computeOffset, resetOffset] = useCursorOffset();

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
			selectionBeforeInput.anchor === 0 &&
			selectionBeforeInput.focus === 0;
		const shouldMergeContentForward =
			forward &&
			selectionBeforeInput.anchor === currentLength &&
			selectionBeforeInput.focus === currentLength;

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
				? selectionBeforeInput.anchor + textOffsetModifier
				: Math.min(selectionBeforeInput.anchor, selectionBeforeInput.focus);

			const selectionAfterInput = {
				anchor: textOffsetAfterInput,
				focus: textOffsetAfterInput,
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
			Math.min(selectionBeforeInput.anchor, selectionBeforeInput.focus) + 1;
		const selectionAfterInput: ISelection = {
			anchor: textOffsetAfterInput,
			focus: textOffsetAfterInput,
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
		<p
			ref={ref}
			onKeyDown={onKeyDown}
			contentEditable={true}
			class={TEXT_WIDGET_CLASS_NAME}
			onBeforeInput={onBeforeInput}
		>
			{resolvedChildren()}
		</p>
	);
}
