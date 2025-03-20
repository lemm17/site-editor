import { WidgetFacade, createAction } from 'entities';
import {
	WIDGETS,
	ITextWidgetFacade,
	ACTION,
	IInputActionData,
	IBaseFacade,
	ITextWidget,
	IPlainTextFacade,
	SmartPath,
} from 'types';
import {
	applySelection,
	computeSelection,
	computeTextLength,
	createPlainTextFacade,
	facadeContainsSelection,
	normalizedTextChildren,
} from 'utils';
import { DEFAULT_EMOJI } from './EmojiFacade';

export default class TextFacade
	extends WidgetFacade
	implements ITextWidgetFacade
{
	private _container: HTMLElement;
	readonly type: WIDGETS.text;

	get children(): IBaseFacade[] {
		return super.children;
	}
	set children(newChildren: IBaseFacade[]) {
		let selection;
		const shouldRestoreSelection = facadeContainsSelection(this);
		if (shouldRestoreSelection) {
			selection = computeSelection(this, this._container, null, null);
		}

		const normalizedChildren = normalizedTextChildren(
			newChildren,
			this._createPlainTextFacade
		);
		super.children = normalizedChildren;

		if (shouldRestoreSelection && selection) {
			// Востанавливаем позицию курсора после нормализации
			applySelection(this._container, this, selection);
		}
	}
	get length(): number {
		return computeTextLength(this);
	}
	get container(): HTMLElement {
		return this._container;
	}

	input(data: IInputActionData): void {
		const insertTextAction = createAction(ACTION.INPUT, {
			initiator: this,
			target: this,
			data: data,
		});

		this._notify(insertTextAction);
	}

	_setContainer(container: HTMLElement): void {
		if (!this._container) {
			this._container = container;
		}
	}

	private _createPlainTextFacade = (
		path: SmartPath,
		text: string = ''
	): IPlainTextFacade => {
		return createPlainTextFacade(
			this.widgetFacadeMap,
			path,
			this.widgetFacadeCreator,
			this.bubbleEvent,
			text
		);
	};

	static sample: ITextWidget = [WIDGETS.text, { value: DEFAULT_EMOJI }];
}
