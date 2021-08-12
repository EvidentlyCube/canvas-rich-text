import {StyleOptions} from "../StyleOptions";
import {defaultStyle} from "../CanvasRichText";
import {assert} from "chai";
import {ArrangedRichText, RichTextBlock, RichTextInline, RichTextInlineWord, RichTextVertex} from "../common";
import {arrangeBlocks} from "./arrangeBlock";

const WIDTH = 10;
const HEIGHT = 10;

function b(...children: RichTextBlock["children"]) {
	return {children, style: defaultStyle};
}

function bs(style: Partial<StyleOptions>, ...children: RichTextBlock["children"]): RichTextBlock {
	return {children, style: {...defaultStyle, ...style}};
}

function t(...words: RichTextInlineWord[]) {
	return {words};
}

function tp(text: string, style?: Partial<StyleOptions>) {
	return {
		text,
		style: {...defaultStyle, ...(style ?? {})},
	};
}

function tps(...text: (string | Partial<StyleOptions>)[]): RichTextInline {
	const style = {
		...defaultStyle,
		...(text.find(x => typeof x !== 'string') as Partial<StyleOptions> ?? {}),
	};

	return t(...text.map(x => typeof x === 'string' ? tp(x, style) : undefined)
		.filter(x => !!x) as RichTextInlineWord[]);
}

function arrange(block: RichTextBlock) {
	return arrangeBlocks(block, x => {
		return {
			width: WIDTH * x.text.length,
			height: HEIGHT,
			lineHeight: HEIGHT,
			xOffset: 0,
			yOffset: 0,
			ascent: 0,
			maxAscent: 0
		};
	});
}

function arrangeAscent(block: RichTextBlock) {
	return arrangeBlocks(block, x => {
		return {
			width: WIDTH * x.text.length,
			height: HEIGHT,
			lineHeight: HEIGHT,
			xOffset: 0,
			yOffset: x.text.length,
			ascent: x.text.length * 2,
			maxAscent: x.text.length * 2,
		};
	});
}

const isHangingRegex = /[qypj]/;
const isTallRegex = /[QAZWSXEDCRFVTGBYHNUJMIKLOPtifjklb]/;

function arrangeSmart(block: RichTextBlock) {
	return arrangeBlocks(block, x => {
		const isHanging = isHangingRegex.test(x.text);
		const isTall = isTallRegex.test(x.text);
		const baseHeight = x.style.fontSize;
		const hangingHeight = isHanging ? 2 : 0;
		const tallHeight = isTall ? 2 : 0;
		return {
			width: WIDTH * x.text.length,
			height: x.style.fontSize + hangingHeight + tallHeight,
			lineHeight: baseHeight + 4,
			xOffset: 0,
			yOffset: 0,
			ascent: x.style.fontSize + tallHeight,
			maxAscent: x.style.fontSize + 2,
		};
	});
}

function assertResult(result: ArrangedRichText, length: number, x: number, y: number, width: number, height: number) {
	assert.lengthOf(result.vertices, length);
	assert.equal(result.x, x);
	assert.equal(result.y, y);
	assert.equal(result.width, width);
	assert.equal(result.height, height);
}

function assertWordVertex(vertex: RichTextVertex, x: number, y: number, opts?: Partial<{ offsetX: number, offsetY: number }>) {
	opts = {...opts};

	assert.equal('word', vertex.type);

	if (vertex.type === 'word') {
		assert.equal(vertex.x, x);
		assert.equal(vertex.y, y);
		assert.equal(vertex.drawOffsetX, opts.offsetX ?? vertex.drawOffsetX);
		assert.equal(vertex.drawOffsetY, opts.offsetY ?? vertex.drawOffsetY);
	}
}

describe("arrangeBlock", () => {
	describe('Single line text', () => {
		it('No render is empty', () => {
			const result = arrange(b());
			assertResult(result, 0, 0, 0, 0, 0);
		});
		it('Single word', () => {
			const result = arrange(b(t(tp('Word'))));
			assertResult(result, 1, 0, 0, 40, 10);
			assertWordVertex(result.vertices[0], 0, 0);
		});
		it('Two words, no space', () => {
			const result = arrange(b(t(tp('Word'), tp('Word'))));
			assertResult(result, 2, 0, 0, 80, 10);
			assertWordVertex(result.vertices[0], 0, 0);
			assertWordVertex(result.vertices[1], 40, 0);
		});
		it('Two words, one space', () => {
			const result = arrange(b(t(tp('Word'), tp(' '), tp('Word'))));
			assertResult(result, 2, 0, 0, 85, 10);
			assertWordVertex(result.vertices[0], 0, 0);
			assertWordVertex(result.vertices[1], 45, 0);
		});
	});
	describe('style:spaceWidth', () => {
		for (let spaceWidth = -10; spaceWidth < 20; spaceWidth += 5) {
			it(`Value=${spaceWidth}`, () => {
				const result = arrange(bs(
					{spaceWidth: spaceWidth},
					tps('word', ' ', 'word'),
				));
				assertResult(result, 2, 0, 0, 80 + spaceWidth, 10);
				assertWordVertex(result.vertices[0], 0, 0);
				assertWordVertex(result.vertices[1], 40 + spaceWidth, 0);
			});
		}
	});
	describe('style:whiteSpace', () => {
		it('"collapse-all" trims white space around and removes duplicate inner whitespace', () => {
			const result = arrange(bs(
				{whiteSpace: 'collapse-all'},
				tps('   ', 'word', '   ', 'word', '   '),
			));
			assertResult(result, 2, 0, 0, 85, 10);
			assertWordVertex(result.vertices[0], 0, 0);
			assertWordVertex(result.vertices[1], 45, 0);
		});

		it('"collapse-outer" keeps all white space around and inside', () => {
			const result = arrange(bs(
				// Aligning to center to be able to properly gauge trimming occurred 
				{width: 200, whiteSpace: 'collapse-outer', textAlign: "center"},
				tps(' ', 'word', '  ', 'word', '   '),
			));
			// Total line width is 80 (8 chars) + 10 (2 spaces) = 90
			assertResult(result, 2, 55, 0, 90, 10);
			assertWordVertex(result.vertices[0], 55, 0);
			assertWordVertex(result.vertices[1], 105, 0);
		});

	});
	describe('Line breaking', () => {
		it('Two words, break normally', () => {
			const result = arrange(bs(
				{width: 60},
				tps('Word', ' ', 'Word'),
			));
			assertResult(result, 2, 0, 0, 40, 25);
			assertWordVertex(result.vertices[0], 0, 0);
			assertWordVertex(result.vertices[1], 0, 15);
		});

		it('Two words, exact width, no breaking', () => {
			const result = arrange(bs(
				{width: 150},
				tps('Word', ' ', 'Word'),
			));
			assertResult(result, 2, 0, 0, 85, 10);
			assertWordVertex(result.vertices[0], 0, 0);
			assertWordVertex(result.vertices[1], 45, 0);
		});

		it('Too long word is not broken', () => {
			const result = arrange(bs(
				{width: 30},
				tps('Word'),
			));
			assertResult(result, 1, 0, 0, 40, 10);
			assertWordVertex(result.vertices[0], 0, 0);
		});

		it('Too long word is not broken, even if multi-segment word', () => {
			const result = arrange(bs(
				{width: 10},
				tps('Wo', 'rd'),
			));
			assertResult(result, 2, 0, 0, 40, 10);
			assertWordVertex(result.vertices[0], 0, 0);
			assertWordVertex(result.vertices[1], 20, 0);
		});

		it('Text after broken line continues with regular spacing', () => {
			const result = arrange(bs(
				{width: 50},
				tps('Wo', ' ', 'rd', ' ', 'mo', ' ', 're'),
			));
			assertResult(result, 4, 0, 0, 45, 25);
			assertWordVertex(result.vertices[0], 0, 0);
			assertWordVertex(result.vertices[1], 25, 0);
			assertWordVertex(result.vertices[2], 0, 15);
			assertWordVertex(result.vertices[3], 25, 15);
		});
	});
	describe('textAlign', () => {
		it('Centers single word', () => {
			const result = arrange(bs(
				{textAlign: 'center', width: 200},
				t(tp('Word')),
			));
			assertResult(result, 1, 80, 0, 40, 10);
			assertWordVertex(result.vertices[0], 80, 0);
		});
		it('Centers single multi-vertex word without space in between', () => {
			const result = arrange(bs(
				{textAlign: 'center', width: 200},
				tps("Wo", 'rd'),
			));
			assertResult(result, 2, 80, 0, 40, 10);
			assertWordVertex(result.vertices[0], 80, 0);
			assertWordVertex(result.vertices[1], 100, 0);
		});
		it('Centers multiple words', () => {
			const result = arrange(bs(
				{textAlign: 'center', width: 200},
				tps('Word', ' ', 'and', ' ', 'text'),
			));
			assertResult(result, 3, 40, 0, 120, 10);
			assertWordVertex(result.vertices[0], 40, 0);
			assertWordVertex(result.vertices[1], 85, 0);
			assertWordVertex(result.vertices[2], 120, 0);
		});
		it('Centers with line breaking', () => {
			const result = arrange(bs(
				{textAlign: "center", width: 50},
				tps("a", "bc", ' ', "abcd"),
			));

			assertResult(result, 3, 5, 0, 40, 25);
			assertWordVertex(result.vertices[0], 10, 0);
			assertWordVertex(result.vertices[1], 20, 0);
			assertWordVertex(result.vertices[2], 5, 15);
		});
		it('Centering rounds down', () => {
			const result = arrange(bs(
				{textAlign: "center", width: 15},
				tps("a"),
			));

			assertResult(result, 1, 2, 0, 10, 10);
			assertWordVertex(result.vertices[0], 2, 0);
		});
		it('Align right with line breaking', () => {
			const result = arrange(bs(
				{textAlign: "right", width: 50},
				tps("a", "bc", ' ', "abcd"),
			));

			assertResult(result, 3, 10, 0, 40, 25);
			assertWordVertex(result.vertices[0], 20, 0);
			assertWordVertex(result.vertices[1], 30, 0);
			assertWordVertex(result.vertices[2], 10, 15);
		});
	});
	describe('css:newLine', () => {
		it('"preserve" will keep newlines', () => {
			const result = arrange(bs(
				{newLine: "preserve"},
				tps('word', "\n", 'word'),
			));

			assertResult(result, 2, 0, 0, 40, 25);
			assertWordVertex(result.vertices[0], 0, 0);
			assertWordVertex(result.vertices[1], 0, 15);
		});

		it('"ignore" will replace newlines with nothing', () => {
			const result = arrange(bs(
				{newLine: "ignore"},
				tps('word', "\n", 'word'),
			));

			assertResult(result, 2, 0, 0, 80, 10);
			assertWordVertex(result.vertices[0], 0, 0);
			assertWordVertex(result.vertices[1], 40, 0);
		});

		it('"space" replaces with a single space, will collapse with whiteSpace=collapse-all', () => {
			const result = arrange(bs(
				{newLine: "space", whiteSpace: 'collapse-all'},
				tps('word', "\n", "\n", "\n", 'word'),
			));

			assertResult(result, 2, 0, 0, 85, 10);
			assertWordVertex(result.vertices[0], 0, 0);
			assertWordVertex(result.vertices[1], 45, 0);
		});

		it('"space" with line break should still work correctly if tab appears', () => {
			const result = arrange(bs(
				{newLine: "space", width: 60},
				tps('word', "\n", "\t", 'word'),
			));

			assertResult(result, 2, 0, 0, 40, 25);
			assertWordVertex(result.vertices[0], 0, 0);
			assertWordVertex(result.vertices[1], 0, 15);
		});
	});
	describe('ascent', () => {
		it("Ascent is applied correctly", () => {
			const result = arrangeAscent(b(tps(
				'w', 'or', 'ded',
			)));

			// Y is the actual "physical" position where the text top-left corner will be on the canvas
			// drawOffsetY is the offset that fillText must be called with, for the text to be
			//   placed correctly, which can vary widldly depending on selected baseline

			// Gist is:
			//  - Y = position + difference between vertex's ascent and line's largest ascent
			//  - drawOffsetY = vertex's own ascent

			// This test was pretty much reverse-engineered, first a correct solution was found
			// by testing in the demo, then a test was written to reproduce its results

			assertResult(result, 3, 0, 0, 60, 14);
			assertWordVertex(result.vertices[0], 0, 4, {offsetY: 1});
			assertWordVertex(result.vertices[1], 10, 2, {offsetY: 2});
			assertWordVertex(result.vertices[2], 30, 0, {offsetY: 3});
		});
	});
	describe('Multi line text', () => {
		it('Multiple inline texts are placed one under another', () => {
			const result = arrange(b(tps('text'), tps('text')));
			assertResult(result, 2, 0, 0, 40, 25);
			assertWordVertex(result.vertices[0], 0, 0);
			assertWordVertex(result.vertices[1], 0, 15);
		});
	});
	describe('Line height', () => {
		it('"varied" line height depends on characters used in the line', () => {
			const result = arrangeSmart(b(
				bs({lineHeight: 'varied'}, t(tp('aoc'))),
				bs({lineHeight: 'varied'}, t(tp('lbt'))),
				bs({lineHeight: 'varied'}, t(tp('qpy'))),
				bs({lineHeight: 'varied'}, t(tp('Qp'))),
			));
			assertResult(result, 4, 0, 0, 30, 14 + 16 + 16 + 18 + 3 * 5);
			assertWordVertex(result.vertices[0], 0, 0);
			assertWordVertex(result.vertices[1], 0, 14 + 5);
			assertWordVertex(result.vertices[2], 0, 14 + 16 + 10);
			assertWordVertex(result.vertices[3], 0, 14 + 16 + 16 + 15);
		});
		it('"static" line height is static', () => {
			const result = arrangeSmart(b(
				bs({lineHeight: 'static'}, t(tp('aoc'))),
				bs({lineHeight: 'static'}, t(tp('lbt'))),
				bs({lineHeight: 'static'}, t(tp('qpy'))),
				bs({lineHeight: 'static'}, t(tp('Qp'))),
			));
			assertResult(result, 4, 0, 2, 30, 18 * 4 + 5 * 3 - 2);
			// noinspection PointlessArithmeticExpressionJS
			assertWordVertex(result.vertices[0], 0, (18 + 5) * 0 + 2);
			// noinspection PointlessArithmeticExpressionJS
			assertWordVertex(result.vertices[1], 0, (18 + 5) * 1 + 0);
			assertWordVertex(result.vertices[2], 0, (18 + 5) * 2 + 2);
			assertWordVertex(result.vertices[3], 0, (18 + 5) * 3 + 0);
		});
	});
});