import { IDirection } from 'types';

export const allowedInputTypes = [
	'insertText',
	'insertParagraph',
	'deleteContentBackward',
	'deleteContentForward',
] as const;

export const resetOffsetKeys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];

export const leaveKeys = [
	'ArrowLeft',
	'ArrowRight',
	'ArrowUp',
	'ArrowDown',
	'Home',
	'End',
] as const;

export const keyboardKeyToDirectionMap: Record<
	(typeof leaveKeys)[number],
	IDirection
> = {
	ArrowLeft: 'left',
	ArrowRight: 'right',
	ArrowUp: 'up',
	ArrowDown: 'down',
	Home: 'home',
	End: 'end',
};
