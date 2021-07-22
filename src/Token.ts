import {CanvasRichTextTokens} from "./common";

export interface TextStyle {
	fontSize: number;
}

export interface TextToken {
	type: CanvasRichTextTokens.Text;
	text: string;
	style: TextStyle;
	metrics: TextMetrics;
}

export interface NewlineToken {
	type: CanvasRichTextTokens.Newline;
}

export type CanvasRichTextToken = TextToken | NewlineToken;
