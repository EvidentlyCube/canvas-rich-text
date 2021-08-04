import {Block, InlineText, InlineTextPiece} from "../Token";
import {StyleOptions} from "../StyleOptions";

export const SPACE = 10;

interface RichTextVertexWord {
	type: 'word';
	text: string;
	style: StyleOptions;
	x: number;
	y: number;
	width: number;
	height: number;
}

export type RichTextVertex = RichTextVertexWord;

export interface RichTextArrangedRender {
	x: number;
	y: number;
	width: number;
	height: number;
	vertices: RichTextVertex[];
}

interface RichTextBlock {
	x: number;
	y: number;
	width: number;
	height: number;
}

interface TextMeasure {
	xOffset: number;
	yOffset: number;
	width: number;
	height: number;
}

type MeasureText = (text: InlineTextPiece) => TextMeasure;

export function arrangeBlocks(blocks: Block, measureText: MeasureText): RichTextArrangedRender {
	const vertices: RichTextVertex[] = [];

	arrangeBlock(blocks, 0, measureText, vertices);

	if (vertices.length === 0) {
		return {
			x: 0,
			y: 0,
			width: 0,
			height: 0,
			vertices: [],
		};
	}

	const x = vertices.reduce((x, vertice) => Math.min(x, vertice.x), Number.MAX_SAFE_INTEGER);
	const y = vertices.reduce((y, vertice) => Math.min(y, vertice.y), Number.MAX_SAFE_INTEGER);
	const width = vertices.reduce((right, vertice) => Math.max(right, vertice.width + vertice.x), 0) - x;
	const height = vertices.reduce((bottom, vertice) => Math.max(bottom, vertice.height + vertice.y), 0) - y;

	return {x, y, width, height, vertices};
}

function arrangeBlock(block: Block, lastBottom: number, measureText: MeasureText, vertices: RichTextVertex[]): number {
	return block.children.reduce((lastBottom, child) => {
		if (child.hasOwnProperty('children')) {
			return arrangeBlock(child as Block, lastBottom, measureText, vertices);
		} else {
			return arrangeInlineText(child as InlineText, block.style, lastBottom, measureText, vertices);
		}
	}, lastBottom);
}

interface Coords {
	right: number;
	bottom: number;
}

interface ArrangedLine {
	width: number;
	height: number;
	vertices: RichTextVertex[];
}

function arrangeInlineText(
	text: InlineText,
	blockStyle: StyleOptions,
	lastBottom: number,
	measureText: MeasureText,
	vertices: RichTextVertex[],
): number {
	let currentLine: ArrangedLine = {height: 0, width: 0, vertices: []};
	const lines = [currentLine];
	const nextRenderPosition = {x: 0, y: lastBottom};
	let canBreakWord = false;

	for (const piece of text.pieces) {
		const measure = measureText(piece);
		let x = nextRenderPosition.x;
		let y = nextRenderPosition.y;

		nextRenderPosition.x += measure.width;

		if (canBreakWord && x + measure.width > blockStyle.width) {
			x = 0;
			y += currentLine.height + blockStyle.lineSpacing;

			currentLine = {height: 0, width: 0, vertices: []};
			lines.push(currentLine);
		}

		if (piece.text.charAt(0) === ' ') {
			// Whitespace is not rendered, only perform word breaking
			canBreakWord = true;
		} else {
			const vertex: RichTextVertex = {
				type: "word",
				x: x + measure.xOffset,
				y: y + measure.yOffset,
				width: measure.width,
				height: measure.height,
				style: piece.style,
				text: piece.text,
			};

			currentLine.vertices.push(vertex);
			currentLine.width = vertex.x + vertex.width;
			currentLine.height = Math.max(currentLine.height, vertex.height);
			vertices.push(vertex);
			canBreakWord = false;
		}
	}

	alignLines(lines, blockStyle);

	return 0;
}

function alignLines(lines: ArrangedLine[], blockStyle: StyleOptions) {
	for (const line of lines) {
		const remainingWidth = blockStyle.width - line.width;

		switch (blockStyle.textAlign) {
			case "left":
				// Do nothing
				break;
			case "center":
				const offset = Math.floor(remainingWidth / 2);
				for (const vertex of line.vertices) {
					vertex.x += offset;
				}
				break;
			case "right":
				break;
			case "justify":
				break;

		}
	}
}