import { IBaseFacade, IProperties } from 'types';
import { removeWidget } from 'utils';
import WidgetFacade from './WidgetFacade';

export default abstract class TextWrapperFacade<
	Properties extends IProperties = {},
> extends WidgetFacade<Properties> {
	set children(newChildrens: IBaseFacade[]) {
		if (newChildrens.length === 0) {
			removeWidget(this, this.frameFacade);
		} else {
			super.children = newChildrens;
		}
	}

	get children(): IBaseFacade[] {
		return super.children;
	}
}
