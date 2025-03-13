import { IFrameFacade, IWidgetFacade, Path } from 'types';
import isPlainTextFacade from '../plainTextActions/isPlainTextFacade';

export default function getWFByPath(
	frame: IFrameFacade,
	path: Path
): IWidgetFacade {
	return path.reduce<IWidgetFacade>(
		(acc, index) => {
			if (isPlainTextFacade(acc.children[index])) {
				return acc;
			}
			return (acc = acc.children[index] as IWidgetFacade);
		},
		frame as unknown as IWidgetFacade
	);
}
