import {ArrangeOptions} from "../CanvasRichText";
import {TextToken, Token, TokenType} from "../Token";

export function groupIntoLines(tokens: Token[], options: ArrangeOptions) {
	const lines: TextToken[][] = [];
	let nextLine: TextToken[] = [];

	let nextX = 0;
	for (const token of tokens) {
		if (token.type === TokenType.Newline) {
			lines.push(nextLine);
			nextLine = [];
			continue;
		}

		const tokenWidth = token.metrics.width;

		if (nextLine.length === 0) {
			nextLine.push(token);
			nextX = token.metrics.width;
		} else if (nextX + options.spaceWidth + tokenWidth > options.width) {
			lines.push(nextLine);
			nextLine = [];
			nextLine.push(token);
			nextX = tokenWidth;
		} else {
			nextLine.push(token);
			nextX += options.spaceWidth + tokenWidth;
		}
	}
	lines.push(nextLine);

	return lines;
}
