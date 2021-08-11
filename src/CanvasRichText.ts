import {StyleOptions} from "./StyleOptions";
import {Block, RichTextArrangedRender, RichTextVertex} from "./common";
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
	newLine: 'preserve'
};

export function arrangeBlock(block: Block): RichTextArrangedRender {
	return arrangeBlocks(block, measureText);
}

export function renderArrangedText(render: RichTextArrangedRender, context: CanvasRenderingContext2D, x: number, y: number): void {
	for (const vertex of render.vertices) {
		renderVertex(vertex, context, x, y);
	}
}

export function renderVertex(vertex: RichTextVertex, context: CanvasRenderingContext2D, x: number, y: number): void {
	configureCanvas(vertex.style, context);
	context.fillText(vertex.text, vertex.x + x + vertex.drawOffsetX, vertex.y + y + vertex.drawOffsetY);
}