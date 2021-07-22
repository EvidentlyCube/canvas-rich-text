import {CanvasRichTextToken} from "./Token";
import {splitString} from "./splitText";
import {CanvasRichTextTokens} from "./common";

interface StyleOptions {
	fontSize: number;
}

interface TokenizeElement {
	tag: string;
	options: StyleOptions;
}

export const RichText = {
	tokenizeString(text: string): CanvasRichTextToken[] {
		const tokens: CanvasRichTextToken[] = [];

		const stylesStack: TokenizeElement[] = [];

		let currentElement: TokenizeElement = {
			tag: 'body',
			options: {
				fontSize: 14,
			},
		};
		for (const htmlToken of splitString(text)) {
			// Text token
			if (typeof htmlToken.text !== 'undefined') {
				tokens.push({
					type: CanvasRichTextTokens.Text,
					text: htmlToken.text,
					fontSize: currentElement.options.fontSize
				});

			} else if (typeof htmlToken.style !== undefined) {
				// Open tag
				stylesStack.push(currentElement);
				currentElement = {
					tag: htmlToken.tag!,
					options: {
						...currentElement.options,
						...htmlToken.style
					}
				};
			} else {
				// Close tag

			}
		}

		return tokens;
	},
};