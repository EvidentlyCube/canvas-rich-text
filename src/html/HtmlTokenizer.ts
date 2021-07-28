import {htmlSplitString} from "./htmlSplitString";
import {StyleOptions} from "../StyleOptions";
import {defaultStyle} from "../CanvasRichText";
import {TokenizeElement} from "./interfaces";
import {extractStylesFromAttributes} from "./extractStylesFromAttributes";
import {measureText} from "../rendering/measureText";
import {Token, TokenType} from "../Token";
import {decodeHtmlEntities} from "./decodeHtmlEntities";

/**
 * HTML Tokenization options.
 */
export interface HtmlTokenizerOptions {
	/**
	 * An array of HTML tag names (must be lowercase) that will have an end line inserted when they are closed.
	 * Defaults to: p, div and br.
	 *
	 * @remarks
	 * `<br/>` tag must **always** be closed.
	 */
	blockTags: string[];
	/**
	 * Default style options to use for text with no custom styling.
	 */
	defaultStyles: StyleOptions;
	/**
	 * A mapping between an attribute name (lowercase) and a style it sets.
	 * By default these attributes are supported:
	 * `fontsize`, `size`, `fontstyle`, `style`, `fontweight`, `weight`,
	 * `fontvariant`, `variant`, `fontfamily`, `family`,
	 * `fontstretch`, `stretch`, `color`
	 */
	attributeToStyleMap: Record<string, keyof StyleOptions>;
	/**
	 * A maping between a tag name (lowercase) and its default styles.
	 * By default these tags have styles:
	 * `b`, `strong`, `i` and `em`.
	 */
	tagDefaultStyles: Record<string, Partial<StyleOptions>>;
	/**
	 * How newline characters should be treated:
	 *  - `space` will replace them with a space
	 *  - `br` will replace them with a `<br/>` tag
	 *
	 *  @remark Windows-style newlines (`\r\n`) are always replaced into a single `\n` tag.
	 */
	newlineBehavior: 'space'|'br';
}

export const HtmlTokenizer = {
	/**
	 * Creates new HTML tokenization options, filled with the default values.
	 */
	createOptions(): HtmlTokenizerOptions {
		return {
			blockTags: ['p', 'div', 'br'],
			tagDefaultStyles: {
				'b': {fontWeight: 'bold'},
				'strong': {fontWeight: 'bold'},
				'i': {fontStyle: 'italic'},
				'em': {fontStyle: 'italic'},
			},
			defaultStyles: {...defaultStyle},
			attributeToStyleMap: {
				fontsize: 'fontSize',
				size: 'fontSize',
				fontstyle: 'fontStyle',
				style: 'fontStyle',
				fontweight: 'fontWeight',
				weight: 'fontWeight',
				fontvariant: "fontVariant",
				variant: 'fontVariant',
				fontfamily: 'fontFamily',
				family: 'fontFamily',
				fontstretch: 'fontStretch',
				stretch: 'fontStretch',
				color: 'color',
			},
			newlineBehavior: 'space'
		};
	},

	/**
	 * Converts an HTML string into tokens.
	 * @param text The text to convert
	 * @param options Optional tokenization options. When not provided it uses the options
	 * as returned by [[createOptions]].
	 */
	tokenizeString(text: string, options?: HtmlTokenizerOptions): Token[] {
		options = options ?? HtmlTokenizer.createOptions();
		const tokens: Token[] = [];
		const stylesStack: TokenizeElement[] = [];

		let currentElement: TokenizeElement = {
			tag: 'body',
			style: {
				...options.defaultStyles,
			},
		};

		text = text.replace(/\r\n/g, "\n");
		if (options.newlineBehavior === "br") {
			text = text.replace(/\n/g, '<br/>');
		}

		for (const htmlToken of htmlSplitString(text)) {
			// Text token
			if (typeof htmlToken.text !== 'undefined') {
				const style: StyleOptions = {
					...currentElement.style,
				};

				const text = decodeHtmlEntities(htmlToken.text);
				tokens.push({
					type: TokenType.Text,
					text: text,
					metrics: measureText(text, style),
					style,
				});

			} else if (typeof htmlToken.style !== 'undefined' && typeof htmlToken.tag !== 'undefined') {
				// Open tag
				const tagStyle = options.tagDefaultStyles[htmlToken.tag] ?? {};
				stylesStack.push(currentElement);
				currentElement = {
					tag: htmlToken.tag,
					style: {
						...currentElement.style,
						...tagStyle,
						...extractStylesFromAttributes(htmlToken.style, options.attributeToStyleMap),
					},
				};
			} else {
				// Close tag
				if (options.blockTags.indexOf(currentElement.tag) !== -1) {
					tokens.push({type: TokenType.Newline});
				}

				if (stylesStack.length > 0) {
					currentElement = stylesStack.pop()!;
				}
			}
		}

		return tokens;
	},
};