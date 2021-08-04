
interface HtmlTokenText {
	type: 0,
	text: string;
}

interface HtmlTokenOpenTag {
	type: 1,
	tag: string;
	style: Record<string, string>;
}

interface HtmlTokenCloseTag {
	type: 2,
	tag: string;
}

export type HtmlToken = HtmlTokenText | HtmlTokenOpenTag | HtmlTokenCloseTag;

const matchRegex = /(<.+?>|\n|[^\S\n]+|[^<\s]+)/g;
const matchHtmlTag = /<(\/?[a-zA-Z0-9]+)(.*?)>/;
const matchHtmlAttributes = /(\S+)="(.+?)"/g;

function matchAll(text: string, regex: RegExp) {
	regex.lastIndex = -1;
	let match;
	const matches = [];
	while (match = regex.exec(text)) {
		matches.push(match);
	}

	return matches;
}

export function htmlSplitString(text: string): HtmlToken[] {
	return matchAll(text, matchRegex)
		.map(match => match[0])
		.reduce((tags:HtmlToken[], match) => {
			if (match.charAt(0) === '<') {
				const res = match.match(matchHtmlTag);
				if (!res) {
					return tags;
				}

				const [,tag, attributesText] = res;
				if (tag.charAt(0) === '/') {
					tags.push({
						type: 2,
						tag: tag.substr(1).toLowerCase()
					});
					return tags;
				}
				const attributes = Array.from(matchAll(attributesText, matchHtmlAttributes))
					.reduce((attrs:Record<string, string>, match) => {
						attrs[match[1]] = match[2];
						return attrs;
					}, {});
				tags.push({
					type: 1,
					tag: tag.toLowerCase(),
					style: attributes
				});
				// Self-closing tag
				if (match.charAt(match.length - 2) === '/') {
					tags.push({
						type: 2,
						tag: `${tag.toLowerCase()}`
					});
				}
				return tags;
			}

			tags.push({
				type: 0,
				text: match
			});
			return tags;
		}, [])
}