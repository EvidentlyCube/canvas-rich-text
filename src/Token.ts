import {StyleOptions} from "./StyleOptions";

export enum TokenType {
	Text = 0,
	Newline = 1
}

export interface TextToken {
	type: TokenType.Text;
	text: string;
	style: StyleOptions;
	metrics: TextMetrics;
}

export interface NewlineToken {
	type: TokenType.Newline;
}

export type Token = TextToken | NewlineToken;
