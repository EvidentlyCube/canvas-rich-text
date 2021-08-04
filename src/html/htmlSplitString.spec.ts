import {assert} from "chai";
import {describe, it} from 'mocha';
import {htmlSplitString, HtmlToken} from "./htmlSplitString";

describe("htmlSplitString", () => {
	it("No html tags", () => {
		const tags = htmlSplitString('Some text');

		assertLength(tags, 3);
		assertText(tags[0], 'Some');
		assertText(tags[1], ' ');
		assertText(tags[2], 'text');
	});
	it("Only html tags", () => {
		const tags = htmlSplitString('<span></span>');

		assertLength(tags, 2);
		assertTag(tags[0], 'span', {});
		assertTag(tags[1], 'span');
	});
	it("Auto close tag", () => {
		const tags = htmlSplitString('<span/>');

		assertLength(tags, 2);
		assertTag(tags[0], 'span', {});
		assertTag(tags[1], 'span');
	});
	it("Html with attributes", () => {
		const tags = htmlSplitString('<span padding="1 2 3 4"/>');

		assertLength(tags, 2);
		assertTag(tags[0], 'span', {padding: '1 2 3 4'});
		assertTag(tags[1], 'span');
	});
	it("Complex", () => {
		const tags = htmlSplitString('text<span size="5" font="arial">other also<hr/>something</span>else yep');

		assertLength(tags, 12);
		assertText(tags[0], 'text');
		assertTag(tags[1], 'span', {size: '5', font: 'arial'});
		assertText(tags[2], 'other');
		assertText(tags[3], ' ');
		assertText(tags[4], 'also');
		assertTag(tags[5], 'hr', {});
		assertTag(tags[6], 'hr');
		assertText(tags[7], 'something');
		assertTag(tags[8], 'span');
		assertText(tags[9], 'else');
		assertText(tags[10], ' ');
		assertText(tags[11], 'yep');
	});
});

function assertLength(givenTags: HtmlToken[], expectedLength: number) {
	assert.equal(givenTags.length, expectedLength);
}

function assertText(givenTag: HtmlToken, text: string) {
	assert.equal(givenTag.type, 0);
	if (givenTag.type === 0) {
		assert.equal(givenTag.text, text);
	}
}

function assertTag(givenTag: HtmlToken, tag: string, style: any = undefined) {
	if (style === undefined) {
		assert.equal(givenTag.type, 2);
		if (givenTag.type === 2) {
			assert.equal(givenTag.tag, tag);
		}

	} else {
		assert.equal(givenTag.type, 1);
		if (givenTag.type === 1) {
			assert.equal(givenTag.tag, tag);
			assert.deepEqual(givenTag.style, style);
		}
	}
}