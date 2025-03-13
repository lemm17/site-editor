import { IWidgetFacade, SmartIndex, SmartPath } from 'types';

export default function cloneSmartPathOfTargetAndIncrementIfNeed(
	target: IWidgetFacade,
	increment: boolean
): SmartPath {
	const targetIndexInParent = target.path.at(-1);

	if (increment) {
		return [
			...target.smartPath.slice(0, -1),
			[targetIndexInParent + 1] as SmartIndex,
		];
	}

	return [
		...target.smartPath.slice(0, -1),
		[targetIndexInParent] as SmartIndex,
	];
}
