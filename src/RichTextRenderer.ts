import {CanvasRichTextToken, TextStyle, TextToken} from "./Token";
import {CanvasRichTextTokens} from "./common";

export interface RichTextRenderPoint {
	x: number;
	y: number;
	token: TextToken;
}

export interface ArrangeOptions {
	width: number;
	spaceWidth: number;
	lineSpacing: number;
	pixelPerfect: boolean;
}

export interface RichTextRenderLine {
	bottom: number;
	points: RichTextRenderPoint[];
}

const canvas = typeof document !== 'undefined'
	? document.createElement('canvas')
	: undefined;
const canvasContext = canvas?.getContext('2d');

function configureCanvas(style: TextStyle, target: CanvasRenderingContext2D) {
	target.font = `${style.fontSize}px Arial`;
	target.textBaseline = 'alphabetic';
}

function groupIntoLines(tokens: CanvasRichTextToken[], options: ArrangeOptions) {
	const lines: TextToken[][] = [];
	let nextLine: TextToken[] = [];

	let nextX = 0;
	for (const token of tokens) {
		if (token.type === CanvasRichTextTokens.Newline) {
			lines.push(nextLine);
			nextLine = [];
			continue;
		}

		const tokenWidth = token.metrics.width;

		if (nextLine.length === 0) {
			nextLine.push(token);
			nextX = token.metrics.width;
		} else if (nextX + options.spaceWidth + tokenWidth > options.width) {
			lines.push(nextLine);
			nextLine = [];
			nextLine.push(token);
			nextX = tokenWidth;
		} else {
			nextLine.push(token);
			nextX += options.spaceWidth + tokenWidth;
		}
	}
	lines.push(nextLine);

	return lines;
}

function arrangeLine(y: number, line: TextToken[], opts: ArrangeOptions): RichTextRenderLine {
	const maxAscent = line.reduce((max, token) => Math.max(max, token.metrics.actualBoundingBoxAscent), 0);
	const maxDescent = line.reduce((max, token) => Math.max(max, token.metrics.actualBoundingBoxDescent), 0);
console.log(maxAscent);
	let nextX = 0;
	return {
		bottom: y + maxDescent + maxAscent,
		points: line.map(token => {
			const x = nextX + opts.spaceWidth;
			nextX = x + token.metrics.width;
			return {
				x, token, y: y + maxAscent// + token.metrics.actualBoundingBoxAscent
			}
		})
	}
}

export const RichTextRenderer = {
	measureText(text: string, style: TextStyle): TextMetrics {
		if (!canvasContext) {
			return {} as any;
		}

		configureCanvas(style, canvasContext);

		return canvasContext.measureText(text);
	},

	arrangeText(tokens: CanvasRichTextToken[], options: Partial<ArrangeOptions>): RichTextRenderLine[] {
		const opts:ArrangeOptions = {
			width: Number.MAX_SAFE_INTEGER,
			lineSpacing: 4,
			spaceWidth: 4,
			pixelPerfect: false,
			...options
		};

		const lines = groupIntoLines(tokens, opts);
		const richLines: RichTextRenderLine[] = [];
		let nextLineY = 0;
		for (const line of lines) {
			const richLine = arrangeLine(nextLineY, line, opts);
			nextLineY = richLine.bottom + opts.lineSpacing;
			richLines.push(richLine);
		}

		return richLines;
	},

	renderLines(lines: RichTextRenderLine[], target: CanvasRenderingContext2D, x: number = 0, y : number = 0) {
		for (const line of lines) {
			for (const point of line.points) {
				configureCanvas(point.token.style, target);
				target.fillText(point.token.text, point.x + x, point.y + y);
			}
		}
	}
}