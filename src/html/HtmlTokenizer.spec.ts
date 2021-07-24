import { assert } from "chai";
import { describe, it } from 'mocha';
import { CanvasRichTextTokens } from "../common";
import { CanvasRichTextToken, } from "../Token";
import { HtmlTokenizer, HtmlTokenizerOptions } from "./HtmlTokenizer";
import {StyleOptions} from "../StyleOptions";

describe("HtmlTokenizer", () => {
	describe('Simple tokenize', () => {
		const options = HtmlTokenizer.defaultHtmlTokenizerOptions;

		it('Empty text', () => {
			const result = HtmlTokenizer.tokenizeString('', options);
			assert.lengthOf(result, 0);
		});
		it('Single word', () => {
			const result = HtmlTokenizer.tokenizeString('word');
			assert.lengthOf(result, 1);

			assertText(result[0], 'word', options);
		});
		it('Multiple words', () => {
			const result = HtmlTokenizer.tokenizeString('lazy brown fox');
			assert.lengthOf(result, 3);

			assertText(result[0], 'lazy', options);
			assertText(result[1], 'brown', options);
			assertText(result[2], 'fox', options);
		});
		it('Html without attributes', () => {
			const result = HtmlTokenizer.tokenizeString('<span>lazy</span> <span>brown fox</span>');
			assert.lengthOf(result, 3);

			assertText(result[0], 'lazy', options);
			assertText(result[1], 'brown', options);
			assertText(result[2], 'fox', options);
		});
		it('Html with attributes', () => {
			const result = HtmlTokenizer.tokenizeString('<span fontSize="50">lazy</span> <span fontSize="17">brown fox</span>');
			assert.lengthOf(result, 3);

			assertText(result[0], 'lazy', options, {fontSize: '50px'});
			assertText(result[1], 'brown', options, {fontSize: '17px'});
			assertText(result[2], 'fox', options, {fontSize: '17px'});
		});
		it('Newline tag insert for block tags', () => {
			const result = HtmlTokenizer.tokenizeString('<p>lazy</p>brown<br/>fox');
			assert.lengthOf(result, 5);

			assertText(result[0], 'lazy', options);
			assertNewline(result[1]);
			assertText(result[2], 'brown', options);
			assertNewline(result[3]);
			assertText(result[4], 'fox', options);
		});
		it('Style is inherited from parent', () => {
			const result = HtmlTokenizer.tokenizeString('<span size="20">lazy<span size="30">brown</span>fox</span>');
			assert.lengthOf(result, 3);

			assertText(result[0], 'lazy', options, {fontSize: '20px'});
			assertText(result[1], 'brown', options, {fontSize: '30px'});
			assertText(result[2], 'fox', options, {fontSize: '20px'});
		});
	});
	describe('Customizing attribute map', () => {
		it("fontSize customization", () => {
			const options = HtmlTokenizer.defaultHtmlTokenizerOptions;
			options.attributeToStyleMap['duck'] = 'fontSize';

			const result = HtmlTokenizer.tokenizeString('<span duck="7">quack</span>', options);
			assert.lengthOf(result, 1);

			assertText(result[0], 'quack', options, {fontSize: '7px'});
		});
	});
	describe('Customizing default styles', () => {
		it("default style is used", () => {
			const options = HtmlTokenizer.defaultHtmlTokenizerOptions;
			options.defaultStyles.fontSize = '44';

			const result = HtmlTokenizer.tokenizeString('test', options);
			assert.lengthOf(result, 1);

			assertText(result[0], 'test', options);
		
		})
	});
});

function assertText(token: CanvasRichTextToken, text: string, options: HtmlTokenizerOptions, overrides?: Partial<StyleOptions>) {
	if (token.type !== CanvasRichTextTokens.Text) {
		assert.equal(token.type, CanvasRichTextTokens.Text);
		return;
	}

	assert.equal(token.text, text);
	assert.equal(token.style.fontSize, overrides?.fontSize ?? options.defaultStyles.fontSize);
}
function assertNewline(token: CanvasRichTextToken) {
	assert.equal(token.type, CanvasRichTextTokens.Newline);
}