import {CanvasRichTextToken} from "../Token";
import {htmlSplitString} from "./htmlSplitString";
import {CanvasRichTextTokens} from "../common";
import {RichTextRenderer} from "../RichTextRenderer";
import {StyleOptions} from "../StyleOptions";
import {CanvasRichText} from "../CanvasRichText";
import {cleanupStyleOption} from "../helpers/CleanupStyleOption";

interface TokenizeElement {
	tag: string;
	style: StyleOptions;
}

export interface HtmlTokenizerOptions {
	blockTags: string[];
	defaultStyles: StyleOptions;
	attributeToStyleMap: Record<string, keyof StyleOptions>;
	tagDefaultStyles: Record<string, Partial<StyleOptions>>;
}

function extractStylesFromAttributes(attributes: Record<string, string>, attributeToStyleMap: Record<string, keyof StyleOptions>) {
	const result: Partial<StyleOptions> = {};

	for (const attribute in attributes) {
		if (!attributes.hasOwnProperty(attribute)) {
			continue;
		}

		const attributeLC = attribute.toLowerCase();
		if (attributeToStyleMap.hasOwnProperty(attributeLC)) {
			const attributeName = attributeToStyleMap[attributeLC];
			const value = cleanupStyleOption(attributeName, attributes[attribute]);
			if (value !== undefined) {
				// Casting to any to avoid painful type juggling. We trust `cleanupStyleOption` returns correct
				result[attributeName] = value as any;
			}
		}
	}

	return result;
}

export const HtmlTokenizer = {
	get defaultHtmlTokenizerOptions(): HtmlTokenizerOptions {
		return {
			blockTags: ['p', 'div', 'br'],
			tagDefaultStyles: {
				'b': {fontWeight: 'bold'},
				'strong': {fontWeight: 'bold'},
				'i': {fontStyle: 'italic'},
				'em': {fontStyle: 'italic'},
			},
			defaultStyles: CanvasRichText.defaultStyle,
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
				stretch: 'fontStretch'
			},
		};
	},

	tokenizeString(text: string, options?: HtmlTokenizerOptions): CanvasRichTextToken[] {
		options = options ?? HtmlTokenizer.defaultHtmlTokenizerOptions;
		const tokens: CanvasRichTextToken[] = [];
		const stylesStack: TokenizeElement[] = [];

		let currentElement: TokenizeElement = {
			tag: 'body',
			style: {
				...options.defaultStyles
			},
		};

		for (const htmlToken of htmlSplitString(text)) {
			// Text token
			if (typeof htmlToken.text !== 'undefined') {
				const style: StyleOptions = {
					...currentElement.style
				};

				tokens.push({
					type: CanvasRichTextTokens.Text,
					text: htmlToken.text,
					metrics: RichTextRenderer.measureText(htmlToken.text, style),
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
					tokens.push({type: CanvasRichTextTokens.Newline});
				}

				currentElement = stylesStack.pop()!;
			}
		}

		return tokens;
	},
};