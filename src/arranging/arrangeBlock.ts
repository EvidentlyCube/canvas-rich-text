import { Block, InlineText, InlineTextPiece, RichTextArrangedRender, RichTextVertex } from "../common";
import { MeasureText } from "../rendering/internal";
import {StyleOptions} from "../StyleOptions";

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
	let isLineStart = true;
	let remainingWhiteSpace = 0;

	for (const piece of text.pieces) {
		const isNewline = piece.text.charAt(0) === "\n";
		const isWhitespace = piece.text.charAt(0) === ' ';

		if (isWhitespace || (isNewline && blockStyle.newLine === 'space')) {
			canBreakWord = true;

			const old = remainingWhiteSpace;
			if (blockStyle.whiteSpace === 'collapse-all') {
				remainingWhiteSpace = isLineStart 
					? 0
					: blockStyle.spaceWidth;
			
			} else if(blockStyle.whiteSpace === 'collapse-outer') {
				if (isLineStart) {
					remainingWhiteSpace = 0;
				} else {
					remainingWhiteSpace += blockStyle.spaceWidth * piece.text.length;
				}
			} else {
				remainingWhiteSpace += piece.text.length * blockStyle.spaceWidth;
			}
			console.log(`Space ${old} -> ${remainingWhiteSpace}`);
			continue;
		} else if (isNewline) {
			if (blockStyle.newLine === 'ignore') {
				continue;
			}

			if (blockStyle.whiteSpace === 'preserve-all') {
				currentLine.width += remainingWhiteSpace;
			}

			nextRenderPosition.x = 0;
			nextRenderPosition.y += currentLine.height + blockStyle.lineSpacing;
			
			currentLine = {height: 0, width: 0, vertices: []};
			lines.push(currentLine);

			continue;
		}

		const measure = measureText(piece);
		let x = nextRenderPosition.x + remainingWhiteSpace;
		let y = nextRenderPosition.y;

		if (canBreakWord && x + measure.width > blockStyle.width) {
			isLineStart = true;
			x = 0;
			remainingWhiteSpace = 0;
			y += currentLine.height + blockStyle.lineSpacing;

			nextRenderPosition.x = 0;
			nextRenderPosition.y = y;

			currentLine = {height: 0, width: 0, vertices: []};
			lines.push(currentLine);
		} else {
			const old = nextRenderPosition.x;
			nextRenderPosition.x = x + measure.width;
			console.log(`'${piece.text}' at ${x}`);
			console.log(`Next render: ${old} -> ${nextRenderPosition.x}`);
		}

		const vertex: RichTextVertex = {
			type: "word",
			x: x + measure.xOffset,
			y: y + measure.yOffset,
			drawOffsetX: 0,
			drawOffsetY: 0,
			width: measure.width,
			height: measure.height,
			style: piece.style,
			text: piece.text,
		};

		currentLine.vertices.push(vertex);
		currentLine.width += remainingWhiteSpace + vertex.width;
		console.log(`Line width: ${currentLine.width}`);
		currentLine.height = Math.max(currentLine.height, vertex.height);
		vertices.push(vertex);

		remainingWhiteSpace = 0;
		canBreakWord = false;
		isLineStart = false;
	}

	if (blockStyle.whiteSpace === 'preserve-all') {
		currentLine.width += remainingWhiteSpace;
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
				for (const vertex of line.vertices) {
					vertex.x += remainingWidth;
				}
				break;

		}
	}
}