import {Block, InlineText, InlineTextPiece} from "../Token";
import {StyleOptions} from "../StyleOptions";
import {defaultStyle} from "../CanvasRichText";
import {arrangeBlocks, RichTextArrangedRender, RichTextVertex} from "./arrangeBlock";
import {assert} from "chai";

const WIDTH = 10;
const SPACE_WIDTH = 5;
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

function arrange2(block: Block) {
	return arrangeBlocks(block, x => {
		if (x.text.charAt(0) === ' ') {
			return {
				width: SPACE_WIDTH * x.text.length,
				height: 0,
				xOffset: 0,
				yOffset: 0,
			}
		}
		return {
			width: WIDTH * x.text.length,
			height: HEIGHT,
			xOffset: 0,
			yOffset: 0,
		}
	});
}


function arrange(measuredWidth: number, measuredHeight: number, block: Block) {
	return arrangeBlocks(block, x => {
		if (x.text.charAt(0) === '0') {
			return {
				width: measuredWidth * x.text.length,
				height: 0,
				xOffset: 0,
				yOffset: 0,
			}
		}
		return {
			width: measuredWidth,
			height: measuredHeight,
			xOffset: 0,
			yOffset: 0,
		}
	});
}

function assertResult(result: RichTextArrangedRender, length: number, x: number, y: number, width: number, height: number) {
	console.log(result);
	assert.lengthOf(result.vertices, length);
	assert.equal(result.x, x);
	assert.equal(result.y, y);
	assert.equal(result.width, width);
	assert.equal(result.height, height);
}

function assertWordVertex(vertex: RichTextVertex, x: number, y: number) {
	assert.equal('word', vertex.type);

	if (vertex.type === 'word') {
		assert.equal(vertex.x, x);
		assert.equal(vertex.y, y);
	}
}

describe("arrangeBlock", () => {
	describe('Single line text', () => {
		it('No render is empty', () => {
			const result = arrange2(b());
			assertResult(result, 0, 0, 0, 0, 0);
		});
		it('Single word', () => {
			const result = arrange2(b(t(tp('Word'))));
			assertResult(result, 1, 0, 0, 40, 10);
			assertWordVertex(result.vertices[0], 0, 0);
		});
		it('Two words, no space', () => {
			const result = arrange2(b(t(tp('Word'), tp('Word'))));
			assertResult(result, 2, 0, 0, 80, 10);
			assertWordVertex(result.vertices[0], 0, 0);
			assertWordVertex(result.vertices[1], 40, 0);
		});
		it('Two words, one space', () => {
			const result = arrange2(b(t(tp('Word'), tp(' '), tp('Word'))));
			assertResult(result, 2, 0, 0, 85, 10);
			assertWordVertex(result.vertices[0], 0, 0);
			assertWordVertex(result.vertices[1], 45, 0);
		});
	});
	describe('Line breaking', () => {
		it('Two words, break normally', () => {
			const result = arrange2(bs(
				{width: 60},
				tps('Word', ' ', 'Word')
			));
			assertResult(result, 2, 0, 0, 40, 25);
			assertWordVertex(result.vertices[0], 0, 0);
			assertWordVertex(result.vertices[1], 0, 15);
		});

		it('Two words, exact width, no breaking', () => {
			const result = arrange2(bs(
				{width: 150},
				tps('Word', ' ', 'Word')
			));
			assertResult(result, 2, 0, 0, 85, 10);
			assertWordVertex(result.vertices[0], 0, 0);
			assertWordVertex(result.vertices[1], 45, 0);
		});

		it('Too long word is not broken', () => {
			const result = arrange2(bs(
				{width: 30},
				tps('Word')
			));
			assertResult(result, 1, 0, 0, 40, 10);
			assertWordVertex(result.vertices[0], 0, 0);
		});

		it('Too long word is not broken, even if multi-segment word', () => {
			const result = arrange2(bs(
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
			const result = arrange2(bs(
				{textAlign: 'center', width: 200},
				t(tp('Word'))
			));
			assertResult(result, 1, 80, 0, 40, 10);
			assertWordVertex(result.vertices[0], 80, 0);
		});
		it('Centers single multi-vertex word without space in between', () => {
			const result = arrange2(bs(
				{textAlign: 'center', width: 200},
				tps("Wo", 'rd')
			));
			assertResult(result, 2, 80, 0, 40, 10);
			assertWordVertex(result.vertices[0], 80, 0);
			assertWordVertex(result.vertices[1], 100, 0);
		});
		it('Centers multiple words', () => {
			const result = arrange2(bs(
				{textAlign: 'center', width: 200},
				tps('Word', ' ', 'and', ' ', 'text')
			));
			assertResult(result, 3, 40, 0, 120, 10);
			assertWordVertex(result.vertices[0], 40, 0);
			assertWordVertex(result.vertices[1], 85, 0);
			assertWordVertex(result.vertices[2], 120, 0);
		});
		xit('Centers with line breaking', () => {
			const result = arrange2(bs(
				{textAlign: "center", width: 50},
				tps("a", "bc", ' ', "abcd")
			));

			assertResult(result, 3,5, 0, 40, 25);
			assertWordVertex(result.vertices[0], 15, 0);
			assertWordVertex(result.vertices[1], 25, 0);
			assertWordVertex(result.vertices[2], 10, 15);
		});
		it('Centering rounds down', () => {
			const result = arrange2(bs(
				{textAlign: "center", width: 15},
				tps("a")
			));

			assertResult(result, 1,2, 0, 10, 10);
			assertWordVertex(result.vertices[0], 2, 0);
		});
	})
});