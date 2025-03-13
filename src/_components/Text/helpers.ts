import { isCollapsed, isPlainTextFacade, isTextNode } from 'utils';
import { ISelection, ITextWidgetFacade } from 'types';
import { allowedInputTypes } from './constants';

/**
 * Обработчик на случай, когда ожидается переход курсора
 * через инлайн-виджет в пустой плейн-текст в начале виджета текста.
 *
 * Легенда:
 * | - курсор
 * Пример:
 * Нажимаем стрелку влево, когда вот так:
 * text
 *   - PlainText('')
 *   - Emoji
 *   - PlainText('|Hello world')
 *
 * Почему-то в нативный selection в anchorNode
 * и focusNode записывается корень текстового виджета
 * с нулевым оффсетом. Если выходить вправо,
 * когда инлайн-виджет в конце, такого эффекта не наблюдается.
 *
 * Данная функция установит курсор корректно,
 * как и ожидается при нормальном поведении.
 */
export function handleExtremeCaseOnArrowKeyDown(
	e: KeyboardEvent,
	selection: ISelection,
	value: ITextWidgetFacade,
	target: HTMLElement
): void | never {
	if (
		selection.direction === 'left' &&
		isCollapsed(selection) &&
		selection.focus === 1 &&
		firstWidgetIsEmptyText(value)
	) {
		console.log(
			'Extreme case on arrow key down. Cursor position will set manually'
		);

		const firstNode = target.childNodes[0];
		if (
			!firstNode ||
			isTextNode(firstNode) ||
			!(firstNode as HTMLElement).id
		) {
			throw new Error(
				`couldn't handle the extreme case correctly, firstNode: ${firstNode}`
			);
		}

		e.preventDefault();

		document.getSelection().setBaseAndExtent(firstNode, 0, firstNode, 0);
	}
}

export function handleExtremeCaseOnInsertText(
	e: InputEvent,
	selection,
	value,
	callback: Function
): void | never {
	if (
		isCollapsed(selection) &&
		selection.focus === 0 &&
		firstWidgetIsEmptyText(value)
	) {
		if (e.inputType === 'insertText') {
			console.log(
				'Extreme case on beforeInput event with insertText inputType. The input will be done manually'
			);

			const nativeSelection = document.getSelection();
			if (
				!nativeSelection.isCollapsed ||
				!nativeSelection.anchorNode ||
				isTextNode(nativeSelection.anchorNode) ||
				!(nativeSelection.anchorNode as HTMLElement).id
			) {
				throw new Error(
					`couldn't handle the extreme case correctly, something went wrong`
				);
			}

			e.preventDefault();

			nativeSelection.anchorNode.textContent = e.data;
			document
				.getSelection()
				.setPosition(nativeSelection.anchorNode, e.data.length);

			callback();
		}
	}
}

function firstWidgetIsEmptyText(value: ITextWidgetFacade): boolean {
	const firstWidget = value.children[0];
	return isPlainTextFacade(firstWidget) && firstWidget.text === '';
}

export function isAllowedInputType(
	type: string
): type is (typeof allowedInputTypes)[number] {
	return allowedInputTypes.includes(
		type as (typeof allowedInputTypes)[number]
	);
}
