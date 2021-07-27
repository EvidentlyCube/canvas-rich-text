import {TextToken} from "../Token";
import {ArrangeOptions, ArrangedLine} from "../CanvasRichText";

const getMaxAscent = (line: TextToken[]) => {
	return line.reduce((max, token) => Math.max(max, token.metrics.actualBoundingBoxAscent), 0);
};

const getMinAscent = (line: TextToken[]) => {
	return line.reduce((max, token) => Math.max(max, token.metrics.actualBoundingBoxDescent), 0);
};

export function arrangeLine(y: number, line: TextToken[], opts: ArrangeOptions): ArrangedLine {
	const maxAscent = getMaxAscent(line);
	const maxDescent = getMinAscent(line);

	let lastTokenRight = 0;
	const points = line.map(token => {
		const x = lastTokenRight + (lastTokenRight > 0 ? opts.spaceWidth : 0);
		lastTokenRight = x + token.metrics.width;
		return {
			token,
			x,
			y: y + maxAscent,
		};
	});

	return {
		width: lastTokenRight,
		height: y + maxDescent + maxAscent,
		words: points,
	};
}
