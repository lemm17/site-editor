export default function deepClone(obj: object): object {
	return JSON.parse(JSON.stringify(obj));
}
