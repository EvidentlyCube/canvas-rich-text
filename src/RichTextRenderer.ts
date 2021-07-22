import { TextStyle, TextToken } from "./Token";

export interface RichTextRenderPoint {
	x: number;
	y: number;
	token: TextToken;
}

export interface ArrangeOptions {
	width: number;
	spaceWidth: number;
	lineSpacing: number;
	pixelPerfect: boolean;
}

export interface RichTextRenderLine {
	left: number;
	top: number;
	right: number;
	bottom: number;
	points: RichTextRenderPoint[];
}

const canvas = typeof document !== 'undefined'
	? document.createElement('canvas')
	: undefined;
const canvasContext = canvas?.getContext('2d');

function configureCanvas(style: TextStyle) {
	if (canvasContext) {
		canvasContext.font = `${style.fontSize} Arial`;
	}
}

export const RichTextRenderer = {
	measureText(text: string, style: TextStyle): TextMetrics {
		if (!canvasContext) {
			return {} as any;
		}

		configureCanvas(style);

		return canvasContext.measureText(text);
	},

	arrangeText(tokens: TextToken[], options: Partial<ArrangeOptions>): RichTextRenderLine[] {
		const opt:ArrangeOptions = {
			width: Number.MAX_SAFE_INTEGER,
			lineSpacing: 4,
			spaceWidth: 4,
			pixelPerfect: false,
			...options
		};

		const lines: RichTextRenderLine[] = [];
		let nextLine: RichTextRenderLine = {
			points: [],
			left: 0,
			right: 0,
			bottom: 0,
			top: 0
		};

		const commitLine = () => {
			lines.push(nextLine);

			const y = nextLine.bottom + opt.lineSpacing;
			nextLine = {
				points: [],
				left: 0,
				right: 0,
				bottom: y,
				top: y
			};
		}

		const refreshLine = () => {
			nextLine.top = nextLine.points.reduce((top, point) => Math.min(top, point.y), nextLine.top);
			nextLine.left = nextLine.points.reduce((left, point) => Math.min(left, point.y), nextLine.left);
			nextLine.bottom = nextLine.points.reduce((bottom, point) => Math.max(bottom, point.y), nextLine.bottom);
			nextLine.right = nextLine.points.reduce((right, point) => Math.max(right, point.y), nextLine.right);
		}

		for (const token of tokens) {
			if (nextLine.right + token.metrics.width + opt.spaceWidth > opt.width && nextLine.points.length > 0) {
				commitLine();
			}

			const space = nextLine.points.length > 0 ? opt.spaceWidth : 0;
			nextLine.points.push({
				x: nextLine.right + space, 
				y: nextLine.top, 
				token
			});
			refreshLine();
		}

		if (nextLine.points.length > 0) {
			commitLine();
		}

		return lines;
	}
}