import { Path } from 'types';

export default function isRightTextPathOf(textPathA: Path, textPathB: Path): boolean {
	const minLength = Math.min(textPathA.length, textPathB.length);

	for (let i = 0; i < minLength; i++) {
		if (textPathA[i] > textPathB[i]) {
			return true;
		} else if (textPathA[i] < textPathB[i]) {
			return false;
		}
	}

	return textPathA.length > textPathB.length;
}
