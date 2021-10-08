import {StyleOptions} from "./StyleOptions";

/**
 * @internal
 * A Rich Text block, that can contain other blocks and inline text.
 * @remark This is returned from a parser and used when arranging rich text.
 * Unless you plan to write your own parser you are unlikely to
 * need to use this data structure.
 */
export interface RichTextBlock {
	/**
	 * Block style.
	 */
	style: StyleOptions;
	/**
	 * Children of the block, a mixed array of inline text and blocks
	 */
	children: (RichTextBlock|RichTextInline)[];
}

/**
 * @internal
 * An inline Rich Text, made of words.
 * @remark This is returned from a parser and used when arranging rich text.
 * Unless you plan to write your own parser you are unlikely to
 * need to use this data structure.
 */
export interface RichTextInline {
	words: RichTextInlineWord[];
}

/**
 * @internal
 * A single Rich Text word with its style
 * @remark This is returned from a parser and used when arranging rich text.
 * Unless you plan to write your own parser you are unlikely to
 * need to use this data structure.
 */
export interface RichTextInlineWord {
	text: string;
	style: StyleOptions;
}

/**
 * @internal
 * Information required to draw a word to a canvas.
 */
interface RichTextVertexWord {
	type: 'word';
	text: string;
	style: StyleOptions;
	x: number;
	y: number;
	drawOffsetX: number;
	drawOffsetY: number;
	width: number;
	height: number;
}

/**
 * @internal
 * A vertex represents information required to draw a part of Rich Text to a canvas.
 * @remark At the moment the only drawable element is a text word, but in the future it can be
 * expanded to include things like underline, borders, horizontal lines or other things.
 */
export type RichTextVertex = RichTextVertexWord;

/**
 * An arranged rich text, ready for drawing.
 */
export interface ArrangedRichText {
	/**
	 * X position of the bounding box of the arranged text.
	 * For text aligned to the left this will almost always be 0, but for centered or right-aligned text,
	 * this will be the offset of the bounding box.
	 * @example If you render right-aligned text in a block of width 500, but the actual text
	 * only takes 200 px, then `x` will be 300. Then when you call [[drawArrangedText]] you can subtract
	 * this value from the first argument, so that the text remains right-aligned, but the whole
	 * text block is aligned to the left.
	 */
	x: number;
	/**
	 * Y position of the bounding box of the arranged text.
	 * So far no case was discovered where this value was different than 0. Theoretically
	 * with a peculiar font it could be possible.
	 */
	y: number;
	/**
	 * Width of the bounding box of the arranged text.
	 * Usually this will be smaller or equal than the width of the outermost block.
	 * It can be larger than that, though, in case of a single word being longer than that,
	 * as there is no word breaking.
	 */
	width: number;
	/**
	 * Height of the bounding box of the arranged text.
	 */
	height: number;
	/**
	 * Vertices that make up the arranged text.
	 */
	vertices: RichTextVertex[];
}

/**
 * Description of measured text's dimensions. Default mechanism uses canvas's `measureText()` method.
 * The following resources were helpful in writing the measure code:
 * @see https://developer.mozilla.org/en-US/docs/Web/API/TextMetrics
 * @see https://stackoverflow.com/questions/35922215/how-to-calculate-uitextview-first-baseline-position-relatively-to-the-origin
 */
export interface TextMeasure {
	/**
	 * X offset of drawing position in relation to the actual "physical" position of text.
	 */
	xOffset: number;
	/**
	 * Y offset of drawing position in relation to the actual "physical" position of text.
	 */
	yOffset: number;
	/**
	 * "Physical" width of the text.
	 */
	width: number;
	/**
	 * "Physical" height of the text
	 */
	height: number;
	/**
	 * Height of the text line, ie the maximum height a text in current style could be.
	 * In the built-in `measureText` function this is accomplished by measuring
	 * the string "WLMIpqjy10" and checking its height (it contains the characters
	 * that are most likely to have tallest ascents and descents).
	 */
	lineHeight: number;
	/**
	 * The distance from the top of the tallest character in the text to the baseline.
	 * With default text rendering in Canvas, the text's baseline is put on the X,Y position
	 * of the draw. So for example, assume you're drawing text at 0,0, depending on baseline
	 * value you'll get these results:
	 *  - "top" - the whole text is drawn in viewport
	 *  - "alphabetic" - most of the text is drawn above the viewport, only descents (the tails) are visible
	 *  - "bottom" - the whole text is drawn above the viewport, nothing is visible
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/textBaseline
	 */
	ascent: number;
	/**
	 * Retrieves the ascent of the tallest glyph in the font. In the built-in `measureText`
	 * function this is accomplished by measuring the string "WLMIpqjy10" and checking its
	 * ascent.
	 *
	 * @remark (assume we work with "alphabetic" baseline, which means the baseline is at the bottom
	 * of the letter "a")
	 * If you draw text by adding its measured ascent to Y, you'll get different baseline position
	 * depending on what characters are included in it. For example "nor" and "bat" will have
	 * unaligned baseline, because "nor" has no tall letters, while "bat" has them. To fix this
	 * we need to know the font's maximum baseline and use that to align the baselines.
	 */
	maxAscent: number;
}

/**
 * A function that measures a styled word
 */
export type MeasureTextCallback = (text: RichTextInlineWord) => TextMeasure;