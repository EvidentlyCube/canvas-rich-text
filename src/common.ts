import { StyleOptions } from "./StyleOptions";

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

interface RichTextVertexWord {
	type: 'word';
	text: string;
	style: StyleOptions;
	x: number;
	y: number;
	drawOffsetX: number;
	drawOffsetY: number;
	width: number;
	height: number;
}

export type RichTextVertex = RichTextVertexWord;

export interface RichTextArrangedRender {
	x: number;
	y: number;
	width: number;
	height: number;
	vertices: RichTextVertex[];
}
