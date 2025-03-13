import { default as getCaretInfo } from './caret';

const ARROW_UP = 'ArrowUp';
const ARROW_DOWN = 'ArrowDown';
const ARROW_LEFT = 'ArrowLeft';
const ARROW_RIGHT = 'ArrowRight';
const HOME = 'Home';
const END = 'End';

export default function shouldLetOutCursor(
	event: KeyboardEvent,
	target: HTMLElement,
	ignoreKeys: string[] = []
): boolean {
	const cursorInfo = getCaretInfo(target);

	if (!cursorInfo) {
		return;
	}

	const {
		isCursorOnLastLine,
		isCursorOnFirstLine,
		isCursorOnStart,
		isCursorOnEnd,
		isCollapsed,
	} = cursorInfo;
	const { shiftKey, ctrlKey, key, metaKey } = event;
	const upKey = key === ARROW_UP;
	const rightKey = key === ARROW_RIGHT;
	const downKey = key === ARROW_DOWN;
	const leftKey = key === ARROW_LEFT;
	const homeKey = key === HOME;
	const endKey = key === END;

	const ignoreKeyPressed = ignoreKeys?.some((ignoreKey) => event[ignoreKey]);

	if (ignoreKeyPressed) {
		return;
	}

	const isCtrl = ctrlKey || metaKey;
	const isCtrlAndNotShift = !shiftKey && isCtrl;
	const shouldLetOutCursorDown =
		downKey && ((!isCtrl && isCursorOnLastLine) || isCtrlAndNotShift);
	const shouldLetOutCursorUp =
		upKey && ((!isCtrl && isCursorOnFirstLine) || isCtrlAndNotShift);
	const shouldLetOutCursorLeft =
		leftKey && isCursorOnStart && (isCollapsed || shiftKey);
	const shouldLetOutCursorRight =
		rightKey && isCursorOnEnd && (isCollapsed || shiftKey);
	const shouldLetOutCursorHome = homeKey && isCtrl;
	const shouldLetOutCursorEnd = endKey && isCtrl;

	return (
		shouldLetOutCursorDown ||
		shouldLetOutCursorUp ||
		shouldLetOutCursorLeft ||
		shouldLetOutCursorRight ||
		shouldLetOutCursorHome ||
		shouldLetOutCursorEnd
	);
}
