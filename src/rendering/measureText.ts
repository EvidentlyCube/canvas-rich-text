import { InlineTextPiece } from "../common";
import { configureCanvas } from "./configureCanvas";
import { TextMeasure } from "./internal";

const canvas: HTMLCanvasElement = typeof document !== 'undefined' ? document.createElement('canvas') : undefined!;
const context: CanvasRenderingContext2D = canvas !== undefined ? canvas.getContext('2d')! : undefined!;

export function measureText(text: InlineTextPiece): TextMeasure {
	configureCanvas(text.style, context);
	const measure = context.measureText(text.text);
	console.log(measure);

	return {
		width: measure.width,
		height: measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent,
		xOffset: measure.actualBoundingBoxLeft,
		yOffset: measure.actualBoundingBoxAscent,
		ascent: measure.actualBoundingBoxAscent
	}
}