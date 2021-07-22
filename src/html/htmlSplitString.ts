
export interface HtmlToken {
	tag?: string;
	style?: Record<string, string>;
	text?: string;
}

const matchRegex = /(<.+?>|\s+|[^<\s]+)/g;
const matchHtmlTag = /<(\/?[a-zA-Z0-9]+)(.*?)>/;
const matchHtmlAttributes = /(\S+)="(.+?)"/g;

export function htmlSplitString(text: string): HtmlToken[] {
	return Array.from(text.matchAll(matchRegex))
		.map(match => match[0])
		.filter(match => match.trim().length > 0)
		.reduce((tags:HtmlToken[], match) => {
			if (match.charAt(0) === '<') {
				const res = match.match(matchHtmlTag);
				if (!res) {
					return tags;
				}

				const [,tag, attributesText] = res;
				if (tag.charAt(0) === '/') {
					tags.push({
						tag: tag.toLowerCase()
					});
					return tags;
				}
				const attributes = Array.from(attributesText.matchAll(matchHtmlAttributes))
					.reduce((attrs:Record<string, string>, match) => {
						attrs[match[1]] = match[2];
						return attrs;
					}, {});
				tags.push({
					tag: tag.toLowerCase(),
					style: attributes
				});
				// Self-closing tag
				if (match.charAt(match.length - 2) === '/') {
					tags.push({
						tag: `/${tag.toLowerCase()}`
					});
				}
				return tags;
			}

			tags.push({
				text: match
			});
			return tags;
		}, [])
}