/**
 * A set of allowed fontStyle values
 */
export const AllowedStyles = new Set(['normal', 'italic']);
/**
 * A set of allowed fontWeight values
 */
export const AllowedWeights = new Set(['100', '200', '300', '400', '500', '600', '700', '800', '900', 'normal', 'bold', 'lighter', 'bolder']);
/**
 * A set of allowed fontVariant values
 */
export const AllowedVariants = new Set(['normal', 'small-caps']);
/**
 * A set of allowed fontStretch values
 */
export const AllowedStretches = new Set(['ultra-condensed', 'extra-condensed', 'condensed', 'semi-condensed', 'normal', 'semi-expanded', 'expanded', 'extra-expanded', 'ultra-expanded']);
/**
 * A set of allowed textAlign values
 */
export const AllowedTextAligns = new Set(['left', 'center', 'right']);
/**
 * A set of allowed whiteSpace values
 */
export const AllowedWhiteSpace = new Set(['collapse-all', 'collapse-outer']);
/**
 * A set of allowed newLine values
 */
export const AllowedNewLines = new Set(['space', 'ignore', 'preserve']);

/**
 * A type containing the allowed fontStyle values
 */
export type FontStyle = 'normal' | 'italic';
/**
 * A type containing the allowed fontWeight values
 */
export type FontWeight = '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | 'normal' | 'bold' | 'lighter' | 'bolder';
/**
 * A type containing the allowed fontVariant values
 */
export type FontVariant = 'normal' | 'small-caps';
/**
 * A type containing the allowed fontStretch values
 */
export type FontStretch = 'ultra-condensed'
| 'extra-condensed'
| 'condensed'
| 'semi-condensed'
| 'normal'
| 'semi-expanded'
| 'expanded'
| 'extra-expanded'
| 'ultra-expanded';
/**
 * A type containing the allowed textAlign values
 */
export type TextAlign = 'left' | 'center' | 'right';
/**
 * A type containing the allowed whiteSpace values
 */
export type WhiteSpace = 'collapse-all'|'collapse-outer';
/**
 * A type containing the allowed newLine values
 */
export type NewLine = 'space'|'ignore'|'preserve';

/**
 * Style applied to the rich text.
 * * color, fontSize, fontFamily, fontStyle, fontWeight, fontVariant and fontStretch apply only to the text
 * * width, textAlign, lineSpacing, whiteSpace, spaceWidth and newLine apply only to the blocks
 */
export interface StyleOptions {
	/**
	 * Color of the text. Can be one of:
	 *  - Short HEX form: `#FFF`
	 *  - Long HEX form: `#FF8800`
	 *  - `rgb(0, 128, 255)`
	 *  - `rgba(0, 128, 255, 0.5)`
	 *  - `hsl(200, 100%, 0%)`
	 *  - `hsla(0, 70%, 100%, 0.3)`
	 */
	color: string;
	/**
	 * Size of the text in pixels.
	 */
	fontSize: number;
	/**
	 * Font family. Can be multiple font families separated by commas. Multi-word families must be enclosed in quotes.
	 */
	fontFamily: string;
	/**
	 * Font Style (`italic` or `normal`)
	 */
	fontStyle: FontStyle;
	/**
	 * Font Weight (`bold`, `light`, `normal`, etc)
	 */
	fontWeight: FontWeight;
	/**
	 * Font Variant (`small-caps` or `normal`)
	 */
	fontVariant: FontVariant;
	/**
	 * Font Stretch (`condensed`, `expanded`, `normal`, etc)
	 */
	fontStretch: FontStretch;

	/**
	 * Width of the block. Is ignored for inline elements.
	 * @remark There is currently nothing stopping you from creating an HTML that
	 * contains a child that is wider than its parent. It'll mostly work but for
	 * now it's best to only set the width for the top-level block.
	 */
	width: number;
	/**
	 * Alignment of the text
	 */
	textAlign: TextAlign;
	/**
	 * Space, in pixels, between each line.
	 */
	lineSpacing: number;
	/**
	 * Rules governing how white spaces are treated:
	 *  - 'collapse-all' - will trim spaces from the start and end of a line, as well as collapse
	 *    any sequence of more than one whitespace characters in a row, into a single space
	 *    (the same way HTML treats spaces)
	 *  - 'collapse-outer' - will inly trim spaces from the start and end of a line, but keep the
	 *     spaces between words. Do note that if this results in an automatic line break,
	 *     the spaces will be trimmed.
	 */
	whiteSpace: WhiteSpace,
	/**
	 * The width of a space character, in pixels.
	 */
	spaceWidth: number;
	/**
	 * How newline characters are treated:
	 *  - `space` - they'll be replaced with spaces
	 *  - `ignore` - they'll be treated as if there was no character at all
	 *  - `preserve` - will cause a line break, the same as if <br> was there
	 */
	newLine: NewLine;
}