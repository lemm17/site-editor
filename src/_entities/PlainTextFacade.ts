import {
	IPlainTextFacade,
	IPlainTextFacadeCfg,
	PLAIN_TEXT_FACADE_TYPE as TYPE,
} from 'types';
import { insertTextPlain as insertTextInner } from 'utils';
import BaseFacade from './BaseFacade';
import { Accessor, Signal, createSignal } from 'solid-js';

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
	readonly isInline: true = true;
	get text(): string {
		return this._text;
	}
	private set text(newText: string) {
		this._text = newText;

		if (this._textSignal) {
			this._textSignal[1](newText || '\u200b');
		}
	}

	private _text: string;
	private _textSignal: Signal<string>;

	constructor(cfg: IPlainTextFacadeCfg) {
		super(cfg);
		this.text = cfg.text;
	}

	_createTextSignal(): Accessor<string> {
		if (!this._textSignal) {
			this._textSignal = createSignal(this.text || '\u200b');
		}

		return this._textSignal[0];
	}

	insertText(insertText: string, startIndex: number, endIndex?: number): void {
		this.text = insertTextInner(this.text, insertText, startIndex, endIndex);
	}

	insertTextForce(...args: Parameters<typeof this.insertText>): void {
		this.text = insertTextInner(this.text, ...args);
	}

	toFrame(): string {
		return super.toFrame() as string;
	}
}
