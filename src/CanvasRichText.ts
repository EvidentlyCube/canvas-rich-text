import {StyleOptions} from "./StyleOptions";
import {TextToken, Token} from "./Token";
import {configureCanvas} from "./rendering/configureCanvas";
import {arrangeLine} from "./rendering/arrangeLine";
import {groupIntoLines} from "./rendering/groupIntoLines";

/**
 * Options for arranging a tokenized text.
 */
export interface ArrangeOptions {
	/**
	 * Maximum width of the text in pixels.
	 *
	 * @remarks
	 * If a single word is longer than this it won't be broken and can possibly be larger than expected.
	 * Check [[ArrangedText.width]] returned from [[arrangeText]] to see if it's equal or smaller than
	 * the word wrap width you provided.
	 */
	wordWrapWidth: number;

	/**
	 * The width of the space between words, in pixels.
	 */
	spaceWidth: number;

	/**
	 * The height of the soace between lines, in pixels.
	 */
	lineSpacing: number;
}

/**
 * A text token arranged for rendering.
 */
export interface ArrangedWord {
	x: number;
	y: number;
	token: TextToken;
}

/**
 * A line of arranged words, for rendering.
 */
export interface ArrangedLine {
	width: number;
	height: number;
	words: ArrangedWord[];
}

/**
 * A text arranged for rendering.
 */
export interface ArrangedText {
	width: number;
	height: number;
	lines: ArrangedLine[];
}

/**
 * The default style. You can modify this to affect how the text will be rendered.
 */
export const defaultStyle: StyleOptions = {
	color: 'black',
	fontSize: '14px',
	fontStyle: 'normal',
	fontVariant: 'normal',
	fontWeight: 'normal',
	fontStretch: 'normal',
	fontFamily: 'arial, sans-serif',
};

/**
 * Arranges Tokens into a randerable text.
 * @param tokens An array of tokens for arranging, at the moment you either have to craft it manually or
 * use [[tokenizeString]] to convert an HTML-string to an array of tokens.
 * @param options Arranging options.
 */
export function arrangeText(tokens: Token[], options: Partial<ArrangeOptions>): ArrangedText {
	const opts: ArrangeOptions = {
		wordWrapWidth: Number.MAX_SAFE_INTEGER,
		lineSpacing: 4,
		spaceWidth: 4,
		...options,
	};

	const lines = groupIntoLines(tokens, opts);
	const richLines: ArrangedLine[] = [];
	let nextLineY = 0;
	for (const line of lines) {
		const richLine = arrangeLine(nextLineY, line, opts);
		nextLineY = richLine.height + opts.lineSpacing;
		richLines.push(richLine);
	}

	return {
		lines: richLines,
		width: richLines.reduce((maxRight, x) => {
			return Math.max(maxRight, x.width);
		}, 0),
		height: richLines.reduce((maxBottom, x) => {
			return Math.max(maxBottom, x.height);
		}, 0) - opts.lineSpacing,
	};
}

/**
 * Renders a single arranged line at the specified position
 * @param line The line to render
 * @param target Canvas context on which to render
 * @param x X position of the line
 * @param y Y position of the line
 */
export function renderLine(line: ArrangedLine, target: CanvasRenderingContext2D, x = 0, y = 0): void {
	for (const point of line.words) {
		configureCanvas(point.token.style, target);
		target.fillText(point.token.text, point.x + x, point.y + y);
	}
}

/**
 * Renders the whole arranged text at the specified position.
 * @param arrangedText The arranged text to render.
 * @param target Canvas context on which to render
 * @param x X position of the text in the canvas
 * @param y Y position of the text in the canvas
 */
export function renderArrangedText(arrangedText: ArrangedText, target: CanvasRenderingContext2D, x = 0, y = 0): void {
	for (const line of arrangedText.lines) {
		renderLine(line, target, x, y);
	}
}
