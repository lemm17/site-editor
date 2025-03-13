import { IBaseFacade, IPlainTextFacade, PLAIN_TEXT_FACADE_TYPE } from 'types';

export default function (facade: IBaseFacade): facade is IPlainTextFacade {
	return facade.type === PLAIN_TEXT_FACADE_TYPE;
}
