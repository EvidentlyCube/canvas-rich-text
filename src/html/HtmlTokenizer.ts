import {htmlSplitString} from "./htmlSplitString";
import {StyleOptions} from "../StyleOptions";
import {defaultStyle} from "../CanvasRichText";
import {TokenizeElement} from "./interfaces";
import {extractStylesFromAttributes} from "./extractStylesFromAttributes";
import {measureText} from "../rendering/measureText";
import {Token, TokenType} from "../Token";

export interface HtmlTokenizerOptions {
	blockTags: string[];
	defaultStyles: StyleOptions;
	attributeToStyleMap: Record<string, keyof StyleOptions>;
	tagDefaultStyles: Record<string, Partial<StyleOptions>>;
}

export const HtmlTokenizer = {
	createOptions(): HtmlTokenizerOptions {
		return {
			blockTags: ['p', 'div', 'br'],
			tagDefaultStyles: {
				'b': {fontWeight: 'bold'},
				'strong': {fontWeight: 'bold'},
				'i': {fontStyle: 'italic'},
				'em': {fontStyle: 'italic'},
			},
			defaultStyles: defaultStyle,
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
		};
	},

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

		for (const htmlToken of htmlSplitString(text)) {
			// Text token
			if (typeof htmlToken.text !== 'undefined') {
				const style: StyleOptions = {
					...currentElement.style,
				};

				tokens.push({
					type: TokenType.Text,
					text: htmlToken.text,
					metrics: measureText(htmlToken.text, style),
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

				currentElement = stylesStack.pop()!;
			}
		}

		return tokens;
	},
};