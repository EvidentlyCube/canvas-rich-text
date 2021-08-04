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
	width: Number.MAX_SAFE_INTEGER,
	textAlign: "left",
	lineSpacing: 5,
	whiteSpace: "collapse-all",
	spaceWidth: 5,
};