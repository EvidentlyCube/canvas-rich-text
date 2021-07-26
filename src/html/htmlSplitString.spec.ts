import { assert } from "chai";
import { describe, it } from 'mocha';
import {HtmlToken, htmlSplitString} from "./htmlSplitString";

describe("htmlSplitString", () => {
	it("No html tags", () => {
		const tags = htmlSplitString('Some text');

		assertLength(tags, 2);
		assertText(tags[0], 'Some');
		assertText(tags[1], 'text');
	});
	it("Only html tags", () => {
		const tags = htmlSplitString('<span></span>');

		assertLength(tags, 2);
		assertTag(tags[0], 'span', {});
		assertTag(tags[1], '/span');
	});
	it("Auto close tag", () => {
		const tags = htmlSplitString('<span/>');

		assertLength(tags, 2);
		assertTag(tags[0], 'span', {});
		assertTag(tags[1], '/span');
	});
	it("Html with attributes", () => {
		const tags = htmlSplitString('<span padding="1 2 3 4"/>');

		assertLength(tags, 2);
		assertTag(tags[0], 'span', {padding: '1 2 3 4'});
		assertTag(tags[1], '/span');
	});
	it("Complex", () => {
		const tags = htmlSplitString('text<span size="5" font="arial">other also<hr/>something</span>else yep');

		assertLength(tags, 10);
		assertText(tags[0], 'text');
		assertTag(tags[1], 'span', {size: '5', font: 'arial'});
		assertText(tags[2], 'other');
		assertText(tags[3], 'also');
		assertTag(tags[4], 'hr', {});
		assertTag(tags[5], '/hr');
		assertText(tags[6], 'something');
		assertTag(tags[7], '/span');
		assertText(tags[8], 'else');
		assertText(tags[9], 'yep');
	});
});

function assertLength(givenTags: HtmlToken[], expectedLength: number) {
	assert.equal(givenTags.length, expectedLength);
}
function assertText(givenTag: HtmlToken, text: string) {
	assert.equal(givenTag.tag, undefined);
	assert.equal(givenTag.style, undefined);
	assert.equal(givenTag.text, text);
}
function assertTag(givenTag: HtmlToken, tag: string, style: any = undefined) {
	assert.equal(givenTag.tag, tag);
	assert.deepEqual(givenTag.style, style);
	assert.equal(givenTag.text, undefined);
}