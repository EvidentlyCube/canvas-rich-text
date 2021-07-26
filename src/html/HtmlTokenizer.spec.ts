import { assert } from "chai";
import { describe, it } from 'mocha';
import { CanvasRichTextTokens } from "../common";
import { CanvasRichTextToken, } from "../Token";
import { HtmlTokenizer } from "./HtmlTokenizer";
import {StyleOptions} from "../StyleOptions";
import {CanvasRichText} from "../CanvasRichText";

describe("HtmlTokenizer", () => {
	describe('Simple tokenize', () => {
		const options = HtmlTokenizer.defaultHtmlTokenizerOptions;

		it('Empty text', () => {
			const result = HtmlTokenizer.tokenizeString('');
			assert.lengthOf(result, 0);
		});
		it('Single word', () => {
			const result = HtmlTokenizer.tokenizeString('word');
			assert.lengthOf(result, 1);

			assertText(result[0], 'word');
		});
		it('Multiple words', () => {
			const result = HtmlTokenizer.tokenizeString('lazy brown fox');
			assert.lengthOf(result, 3);

			assertText(result[0], 'lazy');
			assertText(result[1], 'brown');
			assertText(result[2], 'fox');
		});
		it('Html without attributes', () => {
			const result = HtmlTokenizer.tokenizeString('<span>lazy</span> <span>brown fox</span>');
			assert.lengthOf(result, 3);

			assertText(result[0], 'lazy');
			assertText(result[1], 'brown');
			assertText(result[2], 'fox');
		});
		it('Html with attributes', () => {
			const result = HtmlTokenizer.tokenizeString('<span fontSize="50">lazy</span> <span fontSize="17">brown fox</span>');
			assert.lengthOf(result, 3);

			assertText(result[0], 'lazy', {fontSize: '50px'});
			assertText(result[1], 'brown', {fontSize: '17px'});
			assertText(result[2], 'fox', {fontSize: '17px'});
		});
		it('Newline tag insert for block tags', () => {
			const result = HtmlTokenizer.tokenizeString('<p>lazy</p>brown<br/>fox');
			assert.lengthOf(result, 5);

			assertText(result[0], 'lazy');
			assertNewline(result[1]);
			assertText(result[2], 'brown');
			assertNewline(result[3]);
			assertText(result[4], 'fox');
		});
		it('Style is inherited from parent', () => {
			const result = HtmlTokenizer.tokenizeString('<span size="20">lazy<span size="30">brown</span>fox</span>');
			assert.lengthOf(result, 3);

			assertText(result[0], 'lazy', {fontSize: '20px'});
			assertText(result[1], 'brown', {fontSize: '30px'});
			assertText(result[2], 'fox', {fontSize: '20px'});
		});

		it('Style is popped from stack when token ends', () => {
			const result = HtmlTokenizer.tokenizeString('<span size="20">lazy</span>fox');
			assert.lengthOf(result, 2);

			assertText(result[0], 'lazy', {fontSize: '20px'});
			assertText(result[1], 'fox');
		});
		it('Tag default style works', () => {
			const result = HtmlTokenizer.tokenizeString('<b>bold</b><em>italic</em>');
			assert.lengthOf(result, 2);

			assertText(result[0], 'bold', {fontWeight: 'bold'});
			assertText(result[1], 'italic', {fontStyle: 'italic'});
		});
	});
	describe(`Style specificality`, () => {
		it('parent > default', () => {
			assertText(HtmlTokenizer.tokenizeString('<b><span>child</span></b>')[0], 'child', {fontWeight: "bold"});
		});
		it('tag > parent', () => {
			assertText(HtmlTokenizer.tokenizeString('<span fontWeight="normal"><b>child</b></span>')[0], 'child', {fontWeight: "bold"});
		});
		it('attribute > parent tag', () => {
			assertText(HtmlTokenizer.tokenizeString('<b><span weight="normal">child</span></b>')[0], 'child', {fontWeight: "normal"});
		});
		it('attribute > tag', () => {
			assertText(HtmlTokenizer.tokenizeString('<b weight="normal">child</b>')[0], 'child', {fontWeight: "normal"});
		});
	})
	describe('Customizing attribute map', () => {
		it("fontSize customization", () => {
			const options = HtmlTokenizer.defaultHtmlTokenizerOptions;
			options.attributeToStyleMap['duck'] = 'fontSize';

			const result = HtmlTokenizer.tokenizeString('<span duck="7">quack</span>', options);
			assert.lengthOf(result, 1);

			assertText(result[0], 'quack', {fontSize: '7px'});
		});
	});
	describe('Customizing default styles', () => {
		it("default style is used", () => {
			const options = HtmlTokenizer.defaultHtmlTokenizerOptions;
			options.defaultStyles.fontSize = '44';

			const result = HtmlTokenizer.tokenizeString('test');
			assert.lengthOf(result, 1);

			assertText(result[0], 'test');
		
		})
	});
});

function assertText(token: CanvasRichTextToken, text: string, overrides?: Partial<StyleOptions>) {
	if (token.type !== CanvasRichTextTokens.Text) {
		assert.equal(token.type, CanvasRichTextTokens.Text);
		return;
	}

	assert.equal(token.text, text);
	assert.equal(token.style.fontSize, overrides?.fontSize ?? CanvasRichText.defaultStyle.fontSize);
	assert.equal(token.style.fontFamily, overrides?.fontFamily ?? CanvasRichText.defaultStyle.fontFamily);
	assert.equal(token.style.fontStyle, overrides?.fontStyle ?? CanvasRichText.defaultStyle.fontStyle);
	assert.equal(token.style.fontStretch, overrides?.fontStretch ?? CanvasRichText.defaultStyle.fontStretch);
	assert.equal(token.style.fontWeight, overrides?.fontWeight ?? CanvasRichText.defaultStyle.fontWeight);
	assert.deepEqual(token.style.fontVariant, overrides?.fontVariant ?? CanvasRichText.defaultStyle.fontVariant);
}
function assertNewline(token: CanvasRichTextToken) {
	assert.equal(token.type, CanvasRichTextTokens.Newline);
}