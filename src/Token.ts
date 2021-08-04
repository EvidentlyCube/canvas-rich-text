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

export interface Block{
	style: StyleOptions;
	children: (Block|InlineText)[];
}

export interface InlineText {
	pieces: InlineTextPiece[];
}

export interface InlineTextPiece {
	text: string;
	style: StyleOptions;
}