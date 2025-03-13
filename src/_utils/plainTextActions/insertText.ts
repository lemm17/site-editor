import cutAndSplit from './cutAndSplit';

export default function (
	target: string,
	insertedText: string,
	startIndex: number,
	endIndex?: number
): string {
	const [left, right] = cutAndSplit(
		target,
		startIndex,
		endIndex ?? startIndex
	);

	return [left, insertedText, right].join('');
}
