import {RichTextBlock, RichTextInline, RichTextInlineWord, ArrangedRichText, RichTextVertex} from "../common";
import {MeasureTextCallback} from "../rendering/internal";
import {StyleOptions} from "../StyleOptions";

function isWordWhitespace(word: RichTextInlineWord) {
	const char = word.text.charAt(0);

	return char === "\u0020" // space
		|| char === "\u0009" // tab
		|| char === "\u000B" // line tabulation
		|| char === "\u000C"; // form feed
}

export function arrangeBlocks(blocks: RichTextBlock, measureText: MeasureTextCallback): ArrangedRichText {
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

function arrangeBlock(block: RichTextBlock, lastBottom: number, measureText: MeasureTextCallback, vertices: RichTextVertex[]): number {
	return block.children.reduce((lastBottom, child) => {
		if (child.hasOwnProperty('children')) {
			return arrangeBlock(child as RichTextBlock, lastBottom, measureText, vertices);
		} else {
			return arrangeInlineText(child as RichTextInline, block.style, lastBottom, measureText, vertices);
		}
	}, lastBottom);
}

interface ArrangedLine {
	width: number;
	height: number;
	maxAscent: number;
	vertices: RichTextVertex[];
}

function arrangeInlineText(
	text: RichTextInline,
	blockStyle: StyleOptions,
	lastBottom: number,
	measureText: MeasureTextCallback,
	vertices: RichTextVertex[],
): number {
	let currentLine: ArrangedLine = {height: 0, width: 0, maxAscent: 0, vertices: []};
	const lines = [currentLine];
	const nextRenderPosition = {x: 0, y: lastBottom};

	let canBreakWord = false;
	let isLineStart = true;
	let remainingWhiteSpace = 0;
	const vertexToAscent = new Map<RichTextVertex, number>();

	for (const word of text.words) {
		const isNewline = word.text.charAt(0) === "\n";
		const isWhitespace = isWordWhitespace(word);

		if (isWhitespace || (isNewline && blockStyle.newLine === 'space')) {
			canBreakWord = true;

			if (blockStyle.whiteSpace === 'collapse-all') {
				remainingWhiteSpace = isLineStart
					? 0
					: blockStyle.spaceWidth;

			} else if (blockStyle.whiteSpace === 'collapse-outer') {
				if (isLineStart) {
					remainingWhiteSpace = 0;
				} else {
					remainingWhiteSpace += blockStyle.spaceWidth * word.text.length;
				}
			} else {
				remainingWhiteSpace += word.text.length * blockStyle.spaceWidth;
			}
			continue;
		} else if (isNewline) {
			if (blockStyle.newLine === 'ignore') {
				continue;
			}

			nextRenderPosition.x = 0;
			nextRenderPosition.y += currentLine.height + blockStyle.lineSpacing;

			currentLine = {height: 0, width: 0, maxAscent: 0, vertices: []};
			lines.push(currentLine);

			continue;
		}

		const measure = measureText(word);
		let x = nextRenderPosition.x + remainingWhiteSpace;
		let y = nextRenderPosition.y;

		if (canBreakWord && x + measure.width > blockStyle.width) {
			isLineStart = true;
			x = 0;
			remainingWhiteSpace = 0;
			y += currentLine.height + blockStyle.lineSpacing;

			nextRenderPosition.x = measure.width;
			nextRenderPosition.y = y;

			currentLine = {height: 0, width: 0, maxAscent: 0, vertices: []};
			lines.push(currentLine);
		} else {
			nextRenderPosition.x = x + measure.width;
		}

		const vertex: RichTextVertex = {
			type: "word",
			x: x,
			y: y,
			drawOffsetX: measure.xOffset,
			drawOffsetY: measure.yOffset,
			width: measure.width,
			height: measure.height,
			style: word.style,
			text: word.text,
		};

		vertexToAscent.set(vertex, measure.ascent);

		currentLine.vertices.push(vertex);
		currentLine.width += remainingWhiteSpace + vertex.width;
		currentLine.maxAscent = Math.max(currentLine.maxAscent, measure.ascent);
		currentLine.height = Math.max(currentLine.height, vertex.height);
		vertices.push(vertex);

		remainingWhiteSpace = 0;
		canBreakWord = false;
		isLineStart = false;
	}

	for (const line of lines) {
		for (const vertex of line.vertices) {
			vertex.y += line.maxAscent - vertexToAscent.get(vertex)!;
		}
	}

	alignLines(lines, blockStyle);

	return nextRenderPosition.y + currentLine.height + blockStyle.lineSpacing;
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