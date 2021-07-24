import {CanvasRichTextToken} from "../Token";
import {htmlSplitString} from "./htmlSplitString";
import {CanvasRichTextTokens} from "../common";
import {RichTextRenderer} from "../RichTextRenderer";
import {cleanupStyleOption, StyleOptions} from "../StyleOptions";

interface TokenizeElement {
	tag: string;
	options: StyleOptions;
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
				'b': {},
			},
			defaultStyles: {
				fontSize: '14',
				fontFamily: 'Arial',
				fontStretch: 'normal',
				fontStyle: 'normal',
				fontVariant: [],
				fontWeight: "normal"
			},
			attributeToStyleMap: {
				fontsize: 'fontSize',
				size: 'fontSize',
			},
		};
	},

	tokenizeString(text: string, options?: HtmlTokenizerOptions): CanvasRichTextToken[] {
		options = options ?? HtmlTokenizer.defaultHtmlTokenizerOptions;
		const tokens: CanvasRichTextToken[] = [];
		const stylesStack: TokenizeElement[] = [];

		let currentElement: TokenizeElement = {
			tag: 'body',
			options: {
				...options.defaultStyles
			},
		};

		for (const htmlToken of htmlSplitString(text)) {
			// Text token
			if (typeof htmlToken.text !== 'undefined') {
				const style: StyleOptions = {
					...currentElement.options
				};

				tokens.push({
					type: CanvasRichTextTokens.Text,
					text: htmlToken.text,
					metrics: RichTextRenderer.measureText(htmlToken.text, style),
					style,
				});

			} else if (typeof htmlToken.style !== 'undefined') {
				// Open tag
				stylesStack.push(currentElement);
				currentElement = {
					tag: htmlToken.tag!,
					options: {
						...currentElement.options,
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