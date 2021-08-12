import {StyleOptions} from "../StyleOptions";
import {defaultStyle} from "../CanvasRichText";
import {htmlSplitString, HtmlTokenType} from "./htmlSplitString";
import {extractStylesFromAttributes} from "./extractStylesFromAttributes";
import {RichTextBlock, RichTextInline} from "../common";

function isBlockTag(tag: string) {
	return tag === 'p' || tag === 'div';
}

function getTagStyle(tag: string): Partial<StyleOptions> {
	switch (tag) {
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
	width: 'width',
	newline: 'newLine',
	linespacing: 'lineSpacing',
	spacewidth: 'spaceWidth',
	whitespace: 'whiteSpace',
	textalign: 'textAlign',
	align: 'textAlign',
	lineheight: 'lineHeight',
};

/**
 * Converts an HTML string into a block, that can be later arranged ([[arrangeBlock]]) and finally rendered ([[drawArrangedText]] or [[drawVertex]]).
 *
 * The HTML must fit the following criteria:
 *  - It must be a valid HTML
 *  - Attribute values MUST be enclosed in double quotes (single quotes are unsupported)
 *
 * The following html tags are supported:
 *  - &lt;p&gt; and &lt;div&gt;, which are treated as blocks
 *  - &lt;strong&gt;, &lt;b&gt;, &lt;em&gt;, &lt;i&gt;, which apply `fontWeight: bold` and `fontStyle: italic` respectively
 *  - Any other tag has no default behavior and is treated the same as &lt;span&gt;
 *
 * Text is styled by setting attributes, which are then passed on to the children. Attribute names & values
 * are case insensitive. See the description of [[StyleOptions]] for information how specific styles work.
 * The following attributes exist:
 *  - fontSize & size
 *  - fontVariant & variant
 *  - fontFamily & family
 *  - fontWeight & weight
 *  - fontStyle & style
 *  - fontStretch & stretch
 *  - color
 *  - width
 *  - newLine
 *  - lineSpacing
 *  - spaceWidth
 *  - whiteSpace
 *  - textAlign & align
 *  - lineHeight
 *
 * @param text The text to convert
 * @param styleOverrides The overrides for the default style.
 */
export function parseHtmlString(text: string, styleOverrides?: Partial<StyleOptions>): RichTextBlock {
	const style = {...defaultStyle, ...styleOverrides};

	const rootBlock: RichTextBlock = {children: [], style};
	const blockStack: RichTextBlock[] = [];
	const styleStack: StyleOptions[] = [];

	let currentBlock: RichTextBlock = rootBlock;
	let currentInlineText: RichTextInline | undefined = undefined;
	let currentStyle = style;

	text = text.replace(/\r\n/g, "\n");

	for (const htmlToken of htmlSplitString(text)) {
		switch (htmlToken.type) {
			case HtmlTokenType.Text:
				if (!currentInlineText) {
					currentInlineText = {words: []};
					currentBlock.children.push(currentInlineText);
				}

				currentInlineText.words.push({text: htmlToken.text, style: currentStyle});
				break;
			case HtmlTokenType.OpenTag:
				if (isBlockTag(htmlToken.tag)) {
					styleStack.push(currentStyle);
					currentStyle = {...currentStyle, ...extractStylesFromAttributes(htmlToken.style, attributeToStyle)};

					const newBlock = {children: [], style: currentStyle};
					currentBlock.children.push(newBlock);
					blockStack.push(currentBlock);
					currentBlock = newBlock;
					currentInlineText = undefined;

				} else if (htmlToken.tag === 'br') {
					// <br> is a special case that creates a new inline text
					currentInlineText = undefined;

				} else {
					styleStack.push(currentStyle);
					currentStyle = {
						...currentStyle,
						...getTagStyle(htmlToken.tag),
						...extractStylesFromAttributes(htmlToken.style, attributeToStyle),
					};
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
					currentStyle = styleStack.pop()!;

				} else if (htmlToken.tag === 'br') {
					// Do nothing for <br>

				} else {
					currentStyle = styleStack.pop()!;
				}
				break;
		}
	}

	return rootBlock;
}
