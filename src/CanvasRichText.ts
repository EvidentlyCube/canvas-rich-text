import {StyleOptions} from "./StyleOptions";
import {RichTextBlock, ArrangedRichText, RichTextVertex} from "./common";
import {arrangeBlocks} from "./arranging/arrangeBlock";
import {measureText} from "./rendering/measureText";
import {configureCanvas} from "./rendering/configureCanvas";

/**
 * The default style. You can modify this to affect how the text will be rendered.
 */
export const defaultStyle: StyleOptions = {
	color: 'black',
	fontSize: 14,
	fontStyle: 'normal',
	fontVariant: 'normal',
	fontWeight: 'normal',
	fontStretch: 'normal',
	fontFamily: 'arial, sans-serif',

	width: Number.MAX_SAFE_INTEGER,
	textAlign: "left",
	lineSpacing: 5,
	whiteSpace: "collapse-all",
	spaceWidth: 5,
	newLine: 'preserve',
	lineHeight: 'static'
};

/**
 * Arranges a Rich Text Block into a format that can then be quickly drawn to canvas.
 * @param block Block returned from [[parseHtmlString]], or created either manually or from a custom parser
 */
export function arrangeBlock(block: RichTextBlock): ArrangedRichText {
	return arrangeBlocks(block, measureText);
}

/**
 * Draws the arranged text to the given context at the specified position.
 * @param render Arranged text to draw, acquired from [[arrangeBlock]]
 * @param context Canvas context to which to draw
 * @param x X position to draw to
 * @param y Y position to draw to
 */
export function drawArrangedText(render: ArrangedRichText, context: CanvasRenderingContext2D, x: number, y: number): void {
	for (const vertex of render.vertices) {
		drawVertex(vertex, context, x, y);
	}
}

/**
 * Draws a single vertex to the given context at the specified offset position. The vertex uses its internal
 * position to be drawn, but you can add an optional X/Y offset.
 * @param vertex Vertex to draw
 * @param context Canvas context to which to draw
 * @param xOffset X offset added to the position where the vertex is drawn
 * @param yOffset Y offset added to the position where the vertex is drawn
 */
export function drawVertex(vertex: RichTextVertex, context: CanvasRenderingContext2D, xOffset: number, yOffset: number): void {
	configureCanvas(vertex.style, context);
	context.fillText(vertex.text, vertex.x + xOffset + vertex.drawOffsetX, vertex.y + yOffset + vertex.drawOffsetY);
}