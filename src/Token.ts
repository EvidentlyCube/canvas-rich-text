import {CanvasRichTextTokens} from "./common";

export interface TextToken {
	type: CanvasRichTextTokens.Text;
	text: string;
	fontSize: number;
}

export interface NewlineToken {
	type: CanvasRichTextTokens.Newline;
}

export type CanvasRichTextToken = TextToken | NewlineToken