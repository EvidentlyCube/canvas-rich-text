import {StyleOptions} from "../StyleOptions";
import {defaultStyle} from "../CanvasRichText";
import {assert} from "chai";
import { Block, InlineText, InlineTextPiece, RichTextArrangedRender, RichTextVertex } from "../common";
import { arrangeBlocks } from "./arrangeBlock";

const WIDTH = 10;
const HEIGHT = 10;

function b(...children: Block["children"]) {
	return {children, style: defaultStyle};
}

function bs(style: Partial<StyleOptions>, ...children: Block["children"]): Block {
	return {children, style: {...defaultStyle, ...style}};
}

function t(...pieces: InlineTextPiece[]) {
	return {pieces};
}

function tp(text: string, style?: Partial<StyleOptions>) {
	return {
		text,
		style: {...defaultStyle, ...(style ?? {})},
	};
}

function tps(...text: (string | Partial<StyleOptions>)[]): InlineText {
	const style = {
		...defaultStyle,
		...(text.find(x => typeof x !== 'string') as Partial<StyleOptions> ?? {}),
	};

	return t(...text.map(x => typeof x === 'string' ? tp(x, style) : undefined)
		.filter(x => !!x) as InlineTextPiece[]);
}

function arrange(block: Block) {
	return arrangeBlocks(block, x => {
		return {
			width: WIDTH * x.text.length,
			height: HEIGHT,
			xOffset: 0,
			yOffset: 0,
			ascent: 0
		}
	});
}

function arrangeAscent(block: Block) {
	return arrangeBlocks(block, x => {
		return {
			width: WIDTH * x.text.length,
			height: HEIGHT,
			xOffset: 0,
			yOffset: x.text.length,
			ascent: x.text.length * 2
		}
	});
}

function assertResult(result: RichTextArrangedRender, length: number, x: number, y: number, width: number, height: number) {
	assert.lengthOf(result.vertices, length);
	assert.equal(result.x, x);
	assert.equal(result.y, y);
	assert.equal(result.width, width);
	assert.equal(result.height, height);
}

function assertWordVertex(vertex: RichTextVertex, x: number, y: number, opts?: Partial<{offsetX: number, offsetY: number}>) {
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
		for (let spaceWidth = -10; spaceWidth < 20; spaceWidth+= 5) {
			it(`Value=${spaceWidth}`, () => { 
				const result = arrange(bs(
					{spaceWidth: spaceWidth},
					tps('word', ' ', 'word')
				));
				assertResult(result, 2, 0, 0, 80 + spaceWidth, 10);
				assertWordVertex(result.vertices[0], 0, 0);
				assertWordVertex(result.vertices[1], 40 + spaceWidth, 0);
			})
		}
	});
	describe('style:whiteSpace', () => {
		it('"collapse-all" trims white space around and removes duplicate inner whitespace', () => {
			const result = arrange(bs(
				{whiteSpace: 'collapse-all'},
				tps('   ', 'word', '   ', 'word', '   ')
			));
			assertResult(result, 2, 0, 0, 85, 10);
			assertWordVertex(result.vertices[0], 0, 0);
			assertWordVertex(result.vertices[1], 45, 0);
		});
		it ('"preserve-all" keeps all white space around and inside', () => {
			const result = arrange(bs(
				// Aligning to center to be able to properly gauge no trimming occurred 
				{width: 200, whiteSpace: 'preserve-all', textAlign: "center"},
				tps(' ', 'word', '  ', 'word', '   ')
			));
			// Total line width is 80 (8 chars) + 30 (6 spaces) = 110
			// But text width and position of the resulting draw excludes the outer whitespace
			assertResult(result, 2, 50, 0, 90, 10);
			assertWordVertex(result.vertices[0], 50, 0);
			assertWordVertex(result.vertices[1], 100, 0);
		});
		it ('"preserve-all" drops white-space at the end when word-wrapping', () => {
			const result = arrange(bs(
				// Aligning to right to be able to be able to see that whitespace at the end was dropped 
				{width: 50, whiteSpace: 'preserve-all', textAlign: "right"},
				tps('word', '  ', 'word')
			));

			assertResult(result, 2, 10, 0, 40, 25);
			assertWordVertex(result.vertices[0], 10, 0);
			assertWordVertex(result.vertices[1], 10, 15);
		});
		it ('"preserve-all" keeps white-space at the end when adding line break', () => {
			const result = arrange(bs(
				// Aligning to right to be able to be able to see that whitespace at the end was dropped 
				{width: 100, whiteSpace: 'preserve-all', textAlign: "right", newLine: 'preserve'},
				tps('word', '  ', "\n", 'word')
			));

			assertResult(result, 2, 50, 0, 50, 25);
			assertWordVertex(result.vertices[0], 50, 0);
			assertWordVertex(result.vertices[1], 60, 15);
		});
		it ('"collapse-outer" keeps all white space around and inside', () => {
			const result = arrange(bs(
				// Aligning to center to be able to properly gauge trimming occurred 
				{width: 200, whiteSpace: 'collapse-outer', textAlign: "center"},
				tps(' ', 'word', '  ', 'word', '   ')
			));
			// Total line width is 80 (8 chars) + 10 (2 spaces) = 90
			assertResult(result, 2, 55, 0, 90, 10);
			assertWordVertex(result.vertices[0], 55, 0);
			assertWordVertex(result.vertices[1], 105, 0);
		});
		
	})
	describe('Line breaking', () => {
		it('Two words, break normally', () => {
			const result = arrange(bs(
				{width: 60},
				tps('Word', ' ', 'Word')
			));
			assertResult(result, 2, 0, 0, 40, 25);
			assertWordVertex(result.vertices[0], 0, 0);
			assertWordVertex(result.vertices[1], 0, 15);
		});

		it('Two words, exact width, no breaking', () => {
			const result = arrange(bs(
				{width: 150},
				tps('Word', ' ', 'Word')
			));
			assertResult(result, 2, 0, 0, 85, 10);
			assertWordVertex(result.vertices[0], 0, 0);
			assertWordVertex(result.vertices[1], 45, 0);
		});

		it('Too long word is not broken', () => {
			const result = arrange(bs(
				{width: 30},
				tps('Word')
			));
			assertResult(result, 1, 0, 0, 40, 10);
			assertWordVertex(result.vertices[0], 0, 0);
		});

		it('Too long word is not broken, even if multi-segment word', () => {
			const result = arrange(bs(
				{width: 10},
				tps('Wo', 'rd')
			));
			assertResult(result, 2, 0, 0, 40, 10);
			assertWordVertex(result.vertices[0], 0, 0);
			assertWordVertex(result.vertices[1], 20, 0);
		});
	});
	describe('textAlign', () => {
		it('Centers single word', () => {
			const result = arrange(bs(
				{textAlign: 'center', width: 200},
				t(tp('Word'))
			));
			assertResult(result, 1, 80, 0, 40, 10);
			assertWordVertex(result.vertices[0], 80, 0);
		});
		it('Centers single multi-vertex word without space in between', () => {
			const result = arrange(bs(
				{textAlign: 'center', width: 200},
				tps("Wo", 'rd')
			));
			assertResult(result, 2, 80, 0, 40, 10);
			assertWordVertex(result.vertices[0], 80, 0);
			assertWordVertex(result.vertices[1], 100, 0);
		});
		it('Centers multiple words', () => {
			const result = arrange(bs(
				{textAlign: 'center', width: 200},
				tps('Word', ' ', 'and', ' ', 'text')
			));
			assertResult(result, 3, 40, 0, 120, 10);
			assertWordVertex(result.vertices[0], 40, 0);
			assertWordVertex(result.vertices[1], 85, 0);
			assertWordVertex(result.vertices[2], 120, 0);
		});
		it('Centers with line breaking', () => {
			const result = arrange(bs(
				{textAlign: "center", width: 50},
				tps("a", "bc", ' ', "abcd")
			));

			assertResult(result, 3, 5, 0, 40, 25);
			assertWordVertex(result.vertices[0], 10, 0);
			assertWordVertex(result.vertices[1], 20, 0);
			assertWordVertex(result.vertices[2], 5, 15);
		});
		it('Centering rounds down', () => {
			const result = arrange(bs(
				{textAlign: "center", width: 15},
				tps("a")
			));

			assertResult(result, 1,2, 0, 10, 10);
			assertWordVertex(result.vertices[0], 2, 0);
		});
		it('Align right with line breaking', () => {
			const result = arrange(bs(
				{textAlign: "right", width: 50},
				tps("a", "bc", ' ', "abcd")
			));

			assertResult(result, 3, 10, 0, 40, 25);
			assertWordVertex(result.vertices[0], 20, 0);
			assertWordVertex(result.vertices[1], 30, 0);
			assertWordVertex(result.vertices[2], 10, 15);
		});
		it('Align right works fine with whiteSpace: preserve-all', () => {
			const result = arrange(bs(
				{textAlign: "right", whiteSpace: 'preserve-all', width: 200},
				tps(' ', 'w', 'ord', '  ', 'word', '   ')
			));
			// Total line width is 80 (8 chars) + 30 (6 spaces) = 110
			// But text width and position of the resulting draw excludes the outer whitespace
			assertResult(result, 3, 95, 0, 90, 10);
			assertWordVertex(result.vertices[0], 95, 0);
			assertWordVertex(result.vertices[1], 105, 0);
			assertWordVertex(result.vertices[2], 145, 0);
		});
	});
	describe('css:newLine', () => {
		it('"preserve" will keep newlines', () => {
			const result = arrange(bs(
				{newLine: "preserve"},
				tps('word', "\n", 'word')
			));

			assertResult(result, 2, 0, 0, 40, 25);
			assertWordVertex(result.vertices[0], 0, 0);
			assertWordVertex(result.vertices[1], 0, 15);
		});
		
		it('"ignore" will replace newlines with nothing', () => {
			const result = arrange(bs(
				{newLine: "ignore"},
				tps('word', "\n", 'word')
			));

			assertResult(result, 2, 0, 0, 80, 10);
			assertWordVertex(result.vertices[0], 0, 0);
			assertWordVertex(result.vertices[1], 40, 0);
		});

		it('"space" replaces with a single space, will collapse with whiteSpace=collapse-all', () => {
			const result = arrange(bs(
				{newLine: "space", whiteSpace: 'collapse-all'},
				tps('word', "\n", "\n", "\n", 'word')
			));

			assertResult(result, 2, 0, 0, 85, 10);
			assertWordVertex(result.vertices[0], 0, 0);
			assertWordVertex(result.vertices[1], 45, 0);
		});

		it('"space" replaces with a single space, will not collapse with whiteSpace=preserve-all', () => {
			const result = arrange(bs(
				{newLine: "space", whiteSpace: 'preserve-all'},
				tps('word', "\n", "\n", "\n", 'word')
			));

			assertResult(result, 2, 0, 0, 95, 10);
			assertWordVertex(result.vertices[0], 0, 0);
			assertWordVertex(result.vertices[1], 55, 0);
		});
	});
	describe('ascent', () => {
		it("Ascent is applied correctly", () => {
			const result = arrangeAscent(b(tps(
				'w', 'or', 'ded'
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
	})
});