import { InlineTextPiece } from "../common";
import { configureCanvas } from "./configureCanvas";
import { TextMeasure } from "./internal";


export function measureText(text: InlineTextPiece, context: CanvasRenderingContext2D): TextMeasure {
	configureCanvas(text.style, context);
	const measure = context.measureText(text.text);

	return {
		width: measure.width,
		height: measure.actualBoundingBoxDescent - measure.actualBoundingBoxAscent,
		xOffset: measure.actualBoundingBoxLeft,
		yOffset: 0,
		ascent: measure.actualBoundingBoxAscent
	}
}