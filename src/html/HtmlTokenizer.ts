import {StyleOptions} from "../StyleOptions";
import {defaultStyle} from "../CanvasRichText";
import {htmlSplitString, HtmlTokenType} from "./htmlSplitString";
import {extractStylesFromAttributes} from "./extractStylesFromAttributes";
import { Block, InlineText } from "../common";

function isBlockTag(tag: string) {
	return tag === 'p';
}

function getTagStyle(tag: string): Partial<StyleOptions> {
	switch(tag) {
		case 'b':
		case 'strong':
			return {fontWeight: 'bold'};
		case 'em':
		case 'i':
			return {fontStyle: 'italic'};

		default:
			return {};
	}
}

const attributeToStyle: Record<string, keyof StyleOptions> = {
	fontsize: 'fontSize',
	size: 'fontSize',
	fontvariant: 'fontVariant',
	variant: 'fontVariant',
	fontfamily: 'fontFamily',
	family: 'fontFamily',
	fontweight: 'fontWeight',
	weight: 'fontWeight',
	fontstyle: 'fontStyle',
	style: 'fontStyle',
	fontstretch: 'fontStretch',
	stretch: 'fontStretch',
	color: 'color',
}

export const HtmlTokenizer = {
	/**
	 * Converts an HTML string into tokens.
	 * @param text The text to convert
	 * @param options Optional tokenization options. When not provided it uses the options
	 * as returned by [[createOptions]].
	 */
	tokenizeString(text: string, defStyle?: Partial<StyleOptions>): Block {
		const style = {...defaultStyle, ...defStyle};

		const rootBlock: Block = {children: [], style};
		const blockStack: Block[] = [];
		const styleStack: StyleOptions[] = [];

		let currentBlock: Block = rootBlock;
		let currentInlineText: InlineText | undefined = undefined;
		let currentStyle = style;

		text = text.replace(/\r\n/g, "\n");

		for (const htmlToken of htmlSplitString(text)) {
			switch (htmlToken.type) {
				case HtmlTokenType.Text:
					if (!currentInlineText) {
						currentInlineText = {pieces: []};
						currentBlock.children.push(currentInlineText);
					}

					currentInlineText.pieces.push({text: htmlToken.text, style: currentStyle});
					break;
				case HtmlTokenType.OpenTag:
					if (isBlockTag(htmlToken.tag)) {
						styleStack.push(currentStyle);
						currentStyle = {...currentStyle, ...extractStylesFromAttributes(htmlToken.style, attributeToStyle)}

						const newBlock = {children: [], style: currentStyle};
						currentBlock.children.push(newBlock);
						blockStack.push(currentBlock);
						currentBlock = newBlock;
						currentInlineText = undefined;

					} else if (htmlToken.tag === 'br') {
						// <br> is a special case that creates a new inline text
						currentInlineText = undefined

					} else {
						styleStack.push(currentStyle);
						currentStyle = {
							...currentStyle,
							...getTagStyle(htmlToken.tag),
							...extractStylesFromAttributes(htmlToken.style, attributeToStyle)
						}
					}
					break;

				case HtmlTokenType.CloseTag:
					if (isBlockTag(htmlToken.tag)) {
						const lastBlock = currentBlock;
						currentBlock = blockStack.pop()!;
						currentInlineText = undefined;

						// Remove block when it's empty
						if (lastBlock.children.length === 0) {
							currentBlock.children.splice(currentBlock.children.indexOf(lastBlock), 1);
						}
						currentStyle = styleStack.pop()!

					} else if (htmlToken.tag === 'br') {
						// Do nothing for <br>

					} else {
						currentStyle = styleStack.pop()!
					}
					break;
			}
		}

		return rootBlock;
	},
};