import {StyleOptions} from "./StyleOptions";
import {TextToken, Token} from "./Token";
import {configureCanvas} from "./rendering/configureCanvas";
import {arrangeLine} from "./rendering/arrangeLine";
import {groupIntoLines} from "./rendering/groupIntoLines";

export interface ArrangeOptions {
	width: number;
	spaceWidth: number;
	lineSpacing: number;
}

export interface RichTextRenderPoint {
	x: number;
	y: number;
	token: TextToken;
}

export interface RichTextRenderLine {
	right: number;
	bottom: number;
	points: RichTextRenderPoint[];
}

export interface RichTextArrangedText {
	width: number;
	height: number;
	lines: RichTextRenderLine[];
}

export const defaultStyle: StyleOptions = {
	color: 'black',
	fontSize: '14px',
	fontStyle: 'normal',
	fontVariant: 'normal',
	fontWeight: 'normal',
	fontStretch: 'normal',
	fontFamily: 'arial, sans-serif',
};

export function arrangeText(tokens: Token[], options: Partial<ArrangeOptions>): RichTextArrangedText {
	const opts: ArrangeOptions = {
		width: Number.MAX_SAFE_INTEGER,
		lineSpacing: 4,
		spaceWidth: 4,
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

	return {
		lines: richLines,
		width: richLines.reduce((maxRight, x) => {
			return Math.max(maxRight, x.right);
		}, 0),
		height: richLines.reduce((maxBottom, x) => {
			return Math.max(maxBottom, x.bottom);
		}, 0) - opts.lineSpacing,
	};
}

export function renderLine(line: RichTextRenderLine, target: CanvasRenderingContext2D, x: number = 0, y: number = 0) {
	for (const point of line.points) {
		configureCanvas(point.token.style, target);
		target.fillText(point.token.text, point.x + x, point.y + y);
	}
}

export function renderArrangedText(arrangedText: RichTextArrangedText, target: CanvasRenderingContext2D, x: number = 0, y: number = 0) {
	for (const line of arrangedText.lines) {
		renderLine(line, target, x, y);
	}
}
