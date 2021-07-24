import {CanvasRichTextTokens} from "./common";
import {StyleOptions} from "./StyleOptions";

export interface TextToken {
	type: CanvasRichTextTokens.Text;
	text: string;
	style: StyleOptions;
	metrics: TextMetrics;
}

export interface NewlineToken {
	type: CanvasRichTextTokens.Newline;
}

export type CanvasRichTextToken = TextToken | NewlineToken;
