import {CanvasRichTextToken} from "../Token";
import {htmlSplitString} from "./htmlSplitString";
import {CanvasRichTextTokens} from "../common";

interface StyleOptions {
	fontSize: string;
}

interface TokenizeElement {
	tag: string;
	options: StyleOptions;
}

export interface HtmlTokenizerOptions {
	blockTags: string[];
	defaultFontSize: string;
	attributeToStyleMap: Record<string, keyof StyleOptions>;
}

function extractStylesFromAttributes(attributes: Record<string, string>, attributeToStyleMap: Record<string, keyof StyleOptions>) {
	const result: Partial<StyleOptions> = {};

	for (const attribute in attributes) {
		const attributeLC = attribute.toLowerCase();
		if (attributeToStyleMap.hasOwnProperty(attributeLC)) {
			result[attributeToStyleMap[attributeLC]] = attributes[attribute];
		}
	}

	return result;
}

export const HtmlTokenizer = {
	get defaultHtmlTokenizerOptions(): HtmlTokenizerOptions {
		return{
			blockTags: ['p', 'div', 'br'], 
			defaultFontSize: '14',
			attributeToStyleMap: {
				fontsize: 'fontSize',
				size: 'fontSize',
			}
		}
	},

	tokenizeString(text: string, options?: HtmlTokenizerOptions): CanvasRichTextToken[] {
		options = options ?? HtmlTokenizer.defaultHtmlTokenizerOptions;
		
		const tokens: CanvasRichTextToken[] = [];
		const stylesStack: TokenizeElement[] = [];

		let currentElement: TokenizeElement = {
			tag: 'body',
			options: {
				fontSize: options.defaultFontSize,
			},
		};
		
		for (const htmlToken of htmlSplitString(text)) {
			// Text token
			if (typeof htmlToken.text !== 'undefined') {
				tokens.push({
					type: CanvasRichTextTokens.Text,
					text: htmlToken.text,
					fontSize: parseInt(currentElement.options.fontSize)
				});

			} else if (typeof htmlToken.style !== 'undefined') {
				// Open tag
				stylesStack.push(currentElement);
				currentElement = {
					tag: htmlToken.tag!,
					options: {
						...currentElement.options,
						...extractStylesFromAttributes(htmlToken.style, options.attributeToStyleMap)
					}
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