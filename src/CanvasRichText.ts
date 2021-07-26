import {StyleOptions} from "./StyleOptions";
import {Token, TextToken} from "./Token";
import {configureCanvas} from "./rendering/configureCanvas";
import {arrangeLine} from "./rendering/arrangeLine";
import {groupIntoLines} from "./rendering/groupIntoLines";

export interface ArrangeOptions {
	width: number;
	spaceWidth: number;
	lineSpacing: number;
	pixelPerfect: boolean;
}

export interface RichTextRenderPoint {
	x: number;
	y: number;
	token: TextToken;
}

export interface RichTextRenderLine {
	bottom: number;
	points: RichTextRenderPoint[];
}

export const defaultStyle: StyleOptions = {
	color: 'black',
	fontSize: '14px',
	fontStyle: 'normal',
	fontVariant: [],
	fontWeight: 'normal',
	fontStretch: 'normal',
	fontFamily: 'arial, sans-serif',
};

export function arrangeText(tokens: Token[], options: Partial<ArrangeOptions>): RichTextRenderLine[] {
	const opts: ArrangeOptions = {
		width: Number.MAX_SAFE_INTEGER,
		lineSpacing: 4,
		spaceWidth: 4,
		pixelPerfect: false,
		...options,
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
}

export function renderLine(line: RichTextRenderLine, target: CanvasRenderingContext2D, x: number = 0, y: number = 0) {
	for (const point of line.points) {
		configureCanvas(point.token.style, target);
		target.fillText(point.token.text, point.x + x, point.y + y);
	}
}

export function renderLines(lines: RichTextRenderLine[], target: CanvasRenderingContext2D, x: number = 0, y: number = 0) {
	for (const line of lines) {
		renderLine(line, target, x, y);
	}
}
