import { RichTextInlineWord } from "../common";
import { configureCanvas } from "./configureCanvas";
import { TextMeasure } from "./internal";

const canvas: HTMLCanvasElement = typeof document !== 'undefined' ? document.createElement('canvas') : undefined!;
const context: CanvasRenderingContext2D = canvas !== undefined ? canvas.getContext('2d')! : undefined!;

export function measureText(text: RichTextInlineWord): TextMeasure {
	configureCanvas(text.style, context);
	const measure = context.measureText(text.text);
	const lineHeightMeasure = context.measureText('WLMIpqjy10');

	return {
		width: measure.width,
		height: measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent,
		lineHeight: lineHeightMeasure.actualBoundingBoxAscent + lineHeightMeasure.actualBoundingBoxDescent,
		xOffset: measure.actualBoundingBoxLeft,
		yOffset: measure.actualBoundingBoxAscent,
		ascent: measure.actualBoundingBoxAscent,
		maxAscent: lineHeightMeasure.actualBoundingBoxAscent
	}
}