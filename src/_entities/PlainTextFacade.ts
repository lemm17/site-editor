import {
	IPlainTextFacade,
	IPlainTextFacadeCfg,
	PLAIN_TEXT_FACADE_TYPE as TYPE,
} from 'types';
import { insertText as insertTextInner } from 'utils';
import BaseFacade from './BaseFacade';

export default class PlainTextFacade
	extends BaseFacade<{}>
	implements IPlainTextFacade
{
	get children(): [] {
		return [];
	}
	private set children(_) {}
	readonly type: typeof TYPE = TYPE;
	readonly properties: {} = {};
	get text(): string {
		return this._text;
	}
	private set text(newText: string) {
		this._text = newText;
	}

	private _text: string;

	constructor(cfg: IPlainTextFacadeCfg) {
		super(cfg);
		this.text = cfg.text;
	}

	insertText(insertText: string, startIndex: number, endIndex?: number): void {
		this.text = insertTextInner(this.text, insertText, startIndex, endIndex);
	}

	toFrame(): string {
		return super.toFrame() as string;
	}
}
