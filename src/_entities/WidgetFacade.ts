import { IProperties, WIDGETS, IWidgetFacade, IWidget } from 'types';
import { default as BaseFacade } from './BaseFacade';

export default abstract class WidgetFacade<Properties extends IProperties = {}>
	extends BaseFacade<Properties>
	implements IWidgetFacade<Properties>
{
	readonly type: WIDGETS;
	readonly isInline: boolean = false;

	toFrame(withPath: boolean = false): IWidget<Properties> {
		return super.toFrame(withPath) as IWidget<Properties>;
	}
}
