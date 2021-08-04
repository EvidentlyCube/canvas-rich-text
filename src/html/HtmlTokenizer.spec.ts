import {assert} from "chai";
import {describe, it} from 'mocha';
import {StyleOptions} from "../StyleOptions";
import {defaultStyle} from "../CanvasRichText";
import {HtmlTokenizer} from "./HtmlTokenizer";
import { Block, InlineText, InlineTextPiece } from "../common";

function bs(style: Partial<StyleOptions>, ...children: Block["children"]): Block {
	return {children, style: {...defaultStyle, ...style}};
}

function b(...children: Block["children"]): Block {
	return {children, style: defaultStyle};
}

function t(...pieces: InlineTextPiece[]): InlineText {
	return {pieces};
}

function tp(text: string, style?: Partial<StyleOptions>): InlineTextPiece {
	return {
		text,
		style: {...defaultStyle, ...(style ?? {})},
	};
}

function tps(...text: (string | Partial<StyleOptions>)[]): InlineTextPiece[] {
	const style = {
		...defaultStyle,
		...(text.find(x => typeof x !== 'string') as Partial<StyleOptions> ?? {}),
	};

	return text.map(x => typeof x === 'string' ? tp(x, style) : undefined)
		.filter(x => !!x) as InlineTextPiece[];
}

function btps(...text: (string | Partial<StyleOptions>)[]) {
	return b(t(...tps(...text)));
}


function assertCompare(text: string, expected: Block) {
	const result = HtmlTokenizer.tokenizeString(text, {});
	assert.deepEqual(result, expected);
}

function itAssert(name: string, text: string, expected: Block) {
	it(name, () => assertCompare(text, expected));
}

describe("HtmlTokenizer2", () => {
	describe('Text only cases', () => {
		itAssert('Empty text', "", b());
		itAssert('Single word', "word", b(t(tp("word"))));
		itAssert('Two words', "word word", b(t(tp("word"), tp(" "), tp("word"))));
	});

	describe('Whitespace', () => {
		itAssert('Conserve whitespace', " Conserve  whitespace   ", b(t(
			...tps(' ', 'Conserve', '  ', 'whitespace', '   '),
		)));
		itAssert('Conserve newline', "conserve\nnewline", b(t(
			...tps('conserve', "\n", 'newline'),
		)));
		itAssert('WIN EOF is collapsed to UNIX EOF', "collapse\r\ncarriage-return", b(t(
			...tps('collapse', "\n", 'carriage-return'),
		)));
		itAssert('EOF are a separate token', "newline  \n   separate", b(t(
			...tps('newline', '  ', "\n", '   ', 'separate'),
		)));
		itAssert('Each EOF is separate', "multi\n\n\nnewlines", b(t(
			...tps('multi', "\n", "\n", "\n", 'newlines'),
		)));
	});

	describe('Inline tags', () => {
		itAssert('Empty inline tag is ignored', '<span></span>', b());
		itAssert('Does nothing when no neighbors', '<span>text</span>', btps('text'));
		itAssert('Inserts new piece', 'in<span>ser</span>ted', btps('in', 'ser', 'ted'));
		itAssert('Multiple', 'i<span>n</span><span>s</span>e<span>r</span>ted', btps('i', 'n', 's', 'e', 'r', 'ted'));
	});

	describe('Block tags', () => {
		itAssert("Empty block is ignored", '<p></p>', b());
		itAssert("Creates a single block", '<p>block</p>', b(btps('block')));
		itAssert("Creates a single block with many pieces", '<p>block with pieces</p>', b(btps('block', ' ', 'with', ' ', 'pieces')));
		itAssert('Splits into blocks', '<p>splits</p><p>into</p><p>blocks</p>', b(
			btps('splits'),
			btps('into'),
			btps('blocks'),
		));
		itAssert('Simple Nested Block', '<p><p>nested</p></p>', b(b(btps('nested'))));
		itAssert('Two Nested Blocks', '<p><p>nested</p><p>another</p></p>', b(b(
			btps('nested'),
			btps('another'),
		)));
		itAssert('Mixed text with block', 'text<p>block</p>more', b(
			t(tp('text')),
			btps('block'),
			t(tp('more')),
		));
		itAssert('Complex mixed', '<p>some<p>nested</p>text<p>with<p>extreme</p>nesting</p>here</p>oof', b(
			b(
				t(tp('some')),
				btps('nested'),
				t(tp('text')),
				b(
					t(tp('with')),
					btps('extreme'),
					t(tp('nesting')),
				),
				t(tp('here')),
			),
			t(tp('oof')),
		));
	});

	describe('Tags with style', () => {
		itAssert('Style applied as a whole', '<b>bold</b>', btps('bold', {fontWeight: 'bold'}));
		itAssert('Style applied only to the relevant part', 'not<b>bold</b>not', b(t(
			tp('not'),
			tp('bold', {fontWeight: 'bold'}),
			tp('not'),
		)));
		itAssert('Multiple styles whole', '<b><em>text</em></b>', btps('text', {fontStyle: 'italic', fontWeight: 'bold'}));
		itAssert('Nested different styles', 'not<b>bo<em>italic</em>ld</b>not', b(t(
			tp('not'),
			tp('bo', {fontWeight: 'bold'}),
			tp('italic', {fontWeight: 'bold', fontStyle: 'italic'}),
			tp('ld', {fontWeight: 'bold'}),
			tp('not'),
		)));
		itAssert("Multiple side-by-side", '<b>bold</b> <em>italic</em>', b(t(
			tp('bold', {fontWeight: "bold"}),
			tp(' '),
			tp('italic', {fontStyle: 'italic'}),
		)));
	});

	describe('Tags with style and blocks', () => {
		itAssert('Styled in block', '<p><b>bold</b></p>', b(btps('bold', {fontWeight: 'bold'})));
		itAssert('Block in inline-styled', '<b><p>bold</p></b>', b(bs(
			{fontWeight: 'bold'},
			t(tp('bold', {fontWeight: 'bold'}))
		)));
		itAssert('Multiple inline in block', '<p><b>bold</b> <em>italic</em></p>', b(b(t(
			tp('bold', {fontWeight: 'bold'}),
			tp(' '),
			tp('italic', {fontStyle: 'italic'}),
		))));
	});

	describe('Style overrides', () => {
		itAssert('Simple weight long form', '<span fontWeight="bold">text</span>', btps('text', {fontWeight: "bold"}));
		itAssert('Simple weight short form', '<span weight="bold">text</span>', btps('text', {fontWeight: "bold"}));
		itAssert('Simple style long form', '<span fontStyle="italic">text</span>', btps('text', {fontStyle: "italic"}));
		itAssert('Simple style short form', '<span style="italic">text</span>', btps('text', {fontStyle: "italic"}));
		itAssert('Simple size long form', '<span fontSize="24">text</span>', btps('text', {fontSize: "24px"}));
		itAssert('Simple size short form', '<span size="24">text</span>', btps('text', {fontSize: "24px"}));
		itAssert('Simple variant long form', '<span fontVariant="small-caps">text</span>', btps('text', {fontVariant: "small-caps"}));
		itAssert('Simple variant short form', '<span variant="small-caps">text</span>', btps('text', {fontVariant: "small-caps"}));
		itAssert('Simple stretch long form', '<span fontStretch="expanded">text</span>', btps('text', {fontStretch: "expanded"}));
		itAssert('Simple stretch short form', '<span stretch="expanded">text</span>', btps('text', {fontStretch: "expanded"}));
		itAssert('Simple family long form', '<span fontFamily="Arial, serif">text</span>', btps('text', {fontFamily: "Arial, serif"}));
		itAssert('Simple family short form', '<span family="Arial, serif">text</span>', btps('text', {fontFamily: "Arial, serif"}));

		itAssert('Attribute overrides tag style', '<b weight="normal">text</b>', btps('text', {fontWeight: "normal"}));

		itAssert('Block can provide style', '<p weight="bold">text</p>', b(btps('text', {fontWeight: "bold"})));
	});
});