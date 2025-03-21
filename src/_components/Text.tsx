import {
	IDirection,
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
		props.value.input({
			type: 'insertParagraph',
			timeStamp: e.timeStamp,
			selection: computeSelection(props.value),
		});
	};

	const onDeleteContent = (e: InputEvent, backward: boolean): void => {
		const forward = !backward;
		const selection = computeSelection(props.value);
		const currentLength = props.value.length;

		const shouldMergeContentBackward =
			backward &&
			isCollapsed(selection) &&
			selection.anchorOffset === 0 &&
			selection.focusOffset === 0;
		const shouldMergeContentForward =
			forward &&
			isCollapsed(selection) &&
			selection.anchorOffset === currentLength &&
			selection.focusOffset === currentLength;

		if (shouldMergeContentBackward) {
			props.value.input({
				type: 'mergeContentBackward',
				timeStamp: e.timeStamp,
				selection: selection,
			});
		} else if (shouldMergeContentForward) {
			props.value.input({
				type: 'mergeContentForward',
				timeStamp: e.timeStamp,
				selection: selection,
			});
		} else {
			props.value.input({
				type: backward ? 'deleteContentBackward' : 'deleteContentForward',
				timeStamp: e.timeStamp,
				selection: selection,
			});
		}
	};

	const onInsertText = (e: InputEvent): void => {
		props.value.input({
			type: 'insertText',
			timeStamp: e.timeStamp,
			text: e.data,
			selection: computeSelection(props.value),
		});
	};

	const onKeyDown = (e: KeyboardEvent) => {
		ignoreZeroWidthSpaceIfNeed(e);

		if (e.key in keyboardKeyToDirectionMap) {
			const direction = keyboardKeyToDirectionMap[e.key] as IDirection;
			let selection = computeSelection(props.value, direction);

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
			onMouseEnter={(e) => onMouseEnter(e, ref)}
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
