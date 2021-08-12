import { RichTextInlineWord } from "../common";

export interface TextMeasure {
	xOffset: number;
	yOffset: number;
	width: number;
	height: number;
	lineHeight: number;
	ascent: number;
	maxAscent: number;
}

export type MeasureTextCallback = (text: RichTextInlineWord) => TextMeasure;
