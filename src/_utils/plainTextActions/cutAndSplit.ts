export default function cutAndSplit(
	text: string,
	startIndex: number,
	endIndex: number
): [string, string] {
	return [text.slice(0, startIndex), text.slice(endIndex)];
}
