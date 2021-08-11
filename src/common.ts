import { StyleOptions } from "./StyleOptions";

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
