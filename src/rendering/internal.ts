import { InlineTextPiece } from "../common";

export interface TextMeasure {
	xOffset: number;
	yOffset: number;
	width: number;
	height: number;
	ascent: number;
}

export type MeasureTextCallback = (text: InlineTextPiece) => TextMeasure;
