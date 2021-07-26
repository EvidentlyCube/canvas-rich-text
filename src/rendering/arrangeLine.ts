import {TextToken} from "../Token";
import {ArrangeOptions, RichTextRenderLine} from "../CanvasRichText";

const getMaxAscent = (line: TextToken[]) => {
	return line.reduce((max, token) => Math.max(max, token.metrics.actualBoundingBoxAscent), 0);
};

const getMinAscent = (line: TextToken[]) => {
	return line.reduce((max, token) => Math.max(max, token.metrics.actualBoundingBoxDescent), 0);
};

export function arrangeLine(y: number, line: TextToken[], opts: ArrangeOptions): RichTextRenderLine {
	const maxAscent = getMaxAscent(line);
	const maxDescent = getMinAscent(line);

	let nextX = 0;
	return {
		bottom: y + maxDescent + maxAscent,
		points: line.map(token => {
			const x = nextX + opts.spaceWidth;
			nextX = x + token.metrics.width;
			return {
				x, token, y: y + maxAscent,// + token.metrics.actualBoundingBoxAscent
			};
		}),
	};
}
