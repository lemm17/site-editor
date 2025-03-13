import { FrameFacade, PlainTextFacade, WidgetFacade } from 'entities';
import {
	IFrame,
	IWidget,
	WIDGETS,
	IWidgetFacade,
	IPlainTextFacade,
	PLAIN_TEXT_FACADE_TYPE,
	IBaseFacade,
} from 'types';
import { widgetFacadeMap, DEFAULT_EMOJI } from 'widgets';

describe('Проверка конструктора фрейм-фасада', () => {
	const testedChildrens: IWidget[] = [
		[WIDGETS.text, 'Hello'],
		[
			WIDGETS.blockquote,
			[WIDGETS.text, [WIDGETS.emoji, { value: DEFAULT_EMOJI }], 'hello'],
			[WIDGETS.text, 'world!', [WIDGETS.emoji, { value: DEFAULT_EMOJI }]],
		],
		[WIDGETS.text, 'World!'],
	];
	const testedFrame: IFrame = ['frame', {}, ...testedChildrens];
	const frameFacade = new FrameFacade(testedFrame, widgetFacadeMap);
	const frameFacadeChildren = frameFacade.children;

	checkChildrenWF(frameFacadeChildren, testedChildrens.length);

	const [firstTextWF, blockquoteWF, lastTextWF] = frameFacadeChildren;

	test('first must be text', () => {
		expect(firstTextWF).toMatchObject({
			path: [0],
			type: WIDGETS.text,
			properties: {},
		});

		expect(firstTextWF.children[0] as IPlainTextFacade).toMatchObject({
			path: [0, 0],
			type: PLAIN_TEXT_FACADE_TYPE,
			text: 'Hello',
			properties: {},
		});
	});

	test('second must be quote', () => {
		expect(blockquoteWF).toMatchObject({
			path: [1],
			type: WIDGETS.blockquote,
			properties: {},
		});
	});

	describe('check second childs', () => {
		const [firstBlockquoteTextWF, secondBlockquoteTextWF] =
			blockquoteWF.children as IWidgetFacade[];

		test('check second childs', () => {
			checkChildrenWF(blockquoteWF.children, 2);
		});

		test('check first blockquote text children', () => {
			expect(firstBlockquoteTextWF).toMatchObject({
				path: [1, 0],
				type: WIDGETS.text,
				properties: {},
			});
			checkChildrenWF(firstBlockquoteTextWF.children, 2);
			const [firstEmoji, secondText] = firstBlockquoteTextWF.children as [
				IWidgetFacade,
				IPlainTextFacade,
			];

			expect(firstEmoji).toMatchObject({
				path: [1, 0, 0],
				type: WIDGETS.emoji,
			});
			expect(firstEmoji.properties).toMatchObject({ value: DEFAULT_EMOJI });
			checkWidgetIsLeaf(firstEmoji as IWidgetFacade);

			expect(secondText).toMatchObject({
				path: [1, 0, 1],
				text: 'hello',
				type: PLAIN_TEXT_FACADE_TYPE,
				properties: {},
			});
		});

		test('check second blockquote text children', () => {
			expect(secondBlockquoteTextWF).toMatchObject({
				path: [1, 1],
				type: WIDGETS.text,
				properties: {},
			});

			checkChildrenWF(secondBlockquoteTextWF.children, 2);
			const [firstText, secondEmoji] = secondBlockquoteTextWF.children as [
				IPlainTextFacade,
				IWidgetFacade,
			];

			expect(firstText).toMatchObject({
				path: [1, 1, 0],
				text: 'world!',
				type: PLAIN_TEXT_FACADE_TYPE,
				properties: {},
			});
			expect(secondEmoji).toMatchObject({
				path: [1, 1, 1],
				type: WIDGETS.emoji,
			});
			expect(secondEmoji.properties).toMatchObject({ value: DEFAULT_EMOJI });

			checkWidgetIsLeaf(secondEmoji as IWidgetFacade);
		});
	});

	test('third must be text', () => {
		expect(lastTextWF).toMatchObject({
			path: [2],
			type: WIDGETS.text,
			properties: {},
		});

		expect(lastTextWF.children[0] as IPlainTextFacade).toMatchObject({
			path: [2, 0],
			type: PLAIN_TEXT_FACADE_TYPE,
			text: 'World!',
			properties: {},
		});
	});
});

function checkChildrenWF(children: IBaseFacade[], length: number): void {
	expect(children).toBeInstanceOf(Array);
	expect(children).toHaveLength(length);

	children.forEach((widgetFacade) =>
		expect(
			widgetFacade instanceof WidgetFacade ||
				widgetFacade instanceof PlainTextFacade
		).toBe(true)
	);
}

function checkWidgetIsLeaf(widget: IWidgetFacade): void {
	expect(widget.children).toHaveLength(0);
}
