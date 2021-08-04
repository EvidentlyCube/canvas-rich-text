import {assert} from "chai";
import {describe, it} from 'mocha';
import {__isValidColor, cleanupStyleOption, validCssColorNames} from "./cleanupStyleOption";
import {AllowedNewLines, AllowedStretches, AllowedStyles, AllowedTextAligns, AllowedVariants, AllowedWeights, AllowedWhiteSpace} from "../StyleOptions";

let lastError = {
	field: "",
	value: "",
	error: "",
};
const errorCallback = (field: string, value: string, error: string) => lastError = {field, value, error};

describe("cleanupStyleOption", () => {
	describe('fontSize', () => {
		it("Numbers >0 with or without PX are valid", () => {
			assert.equal(cleanupStyleOption("fontSize", "14"), "14px");
			assert.equal(cleanupStyleOption("fontSize", "7px"), "7px");
			assert.equal(cleanupStyleOption("fontSize", "0.1px"), "0.1px");
			assert.equal(cleanupStyleOption("fontSize", "+7.932px"), "7.932px");
		});
		it("Can prefix with +", () => {
			assert.equal(cleanupStyleOption("fontSize", "+1.23"), "1.23px");
		});
		it("Negative numbers are invalid", () => {
			assert.equal(cleanupStyleOption("fontSize", "-1"), undefined);
		});
		it("Zero is invalid", () => {
			assert.equal(cleanupStyleOption("fontSize", "0"), undefined);
		});
		it("Different size types are invalid", () => {
			assert.equal(cleanupStyleOption("fontSize", "7pt"), undefined);
			assert.equal(cleanupStyleOption("fontSize", "7vw"), undefined);
			assert.equal(cleanupStyleOption("fontSize", "7%"), undefined);
			assert.equal(cleanupStyleOption("fontSize", "7vmax"), undefined);
		});
		it("Any other text is invalid", () => {
			assert.equal(cleanupStyleOption("fontSize", "seven"), undefined);
			assert.equal(cleanupStyleOption("fontSize", "smaller"), undefined);
			assert.equal(cleanupStyleOption("fontSize", "7.7.7"), undefined);
			assert.equal(cleanupStyleOption("fontSize", "3,14"), undefined);
			assert.equal(cleanupStyleOption("fontSize", ""), undefined);
		});
		it("Calls error callback on error", () => {
			cleanupStyleOption("fontSize", "invalid", errorCallback);
			assertError("fontSize", "invalid", "'invalid' is not a valid value for fontSize");

			cleanupStyleOption("fontSize", "0", errorCallback);
			assertError("fontSize", "0", "fontSize must be larger than 0");
		});
	});

	describe("fontFamily", () => {
		it("Any string longer than 0 characters is accepted", () => {
			assert.equal(cleanupStyleOption("fontFamily", "Arial"), "Arial");
			assert.equal(cleanupStyleOption("fontFamily", '"Open Sans", Verdana, sans-serif'), '"Open Sans", Verdana, sans-serif');
		});
		it("Empty string returns undefined", () => {
			assert.equal(cleanupStyleOption("fontFamily", ""), undefined);
		});
		it("Calls error callback on error", () => {
			cleanupStyleOption("fontFamily", "", errorCallback);
			assertError("fontFamily", "", "fontFamily cannot be empty");
		});
	});

	describe("fontStyle", () => {
		Array.from(AllowedStyles.values()).forEach(style => it(`'${style}' is a valid value in all letter cases`, () => {
			assert.equal(cleanupStyleOption("fontStyle", style), style);
			assert.equal(cleanupStyleOption("fontStyle", style.toLowerCase()), style.toLowerCase());
			assert.equal(cleanupStyleOption("fontStyle", style.toUpperCase()), style.toUpperCase());
		}));
		describe("Other style values are invalid and return undefined, also call error callback", () => {
			const testValues = Array.from(AllowedStyles.values()).map(x => x + '-invalid').concat([
				'',
				' ',
				'invalid',
			]);
			testValues.forEach(style => it(`'${style}'`, () => {
				assert.equal(cleanupStyleOption("fontStyle", style, errorCallback), undefined);
				assertError("fontStyle", style, `'${style}' is not a valid fontStyle value`);
			}));
		});
	});

	describe("fontWeight", () => {
		Array.from(AllowedWeights.values()).forEach(style => it(`'${style}' is a valid value in all letter cases`, () => {
			assert.equal(cleanupStyleOption("fontWeight", style), style);
			assert.equal(cleanupStyleOption("fontWeight", style.toLowerCase()), style.toLowerCase());
			assert.equal(cleanupStyleOption("fontWeight", style.toUpperCase()), style.toUpperCase());
		}));
		describe("Other weight values are invalid and return undefined, also call error callback", () => {
			const testValues = Array.from(AllowedWeights.values()).map(x => x + '-invalid').concat([
				'',
				' ',
				'invalid',
			]);
			testValues.forEach(style => it(`'${style}'`, () => {
				assert.equal(cleanupStyleOption("fontWeight", style, errorCallback), undefined);
				assertError("fontWeight", style, `'${style}' is not a valid fontWeight value`);
			}));
		});
	});

	describe("fontStretch", () => {
		Array.from(AllowedStretches.values()).forEach(style => it(`'${style}' is a valid value in all letter cases`, () => {
			assert.equal(cleanupStyleOption("fontStretch", style), style);
			assert.equal(cleanupStyleOption("fontStretch", style.toLowerCase()), style.toLowerCase());
			assert.equal(cleanupStyleOption("fontStretch", style.toUpperCase()), style.toUpperCase());
		}));
		describe("Other stretch values are invalid and return undefined, also call error callback", () => {
			const testValues = Array.from(AllowedStretches.values()).map(x => x + '-invalid').concat([
				'',
				' ',
				'invalid',
			]);
			testValues.forEach(style => it(`'${style}'`, () => {
				assert.equal(cleanupStyleOption("fontStretch", style, errorCallback), undefined);
				assertError("fontStretch", style, `'${style}' is not a valid fontStretch value`);
			}));
		});
	});

	describe("fontVariant", () => {
		Array.from(AllowedVariants.values()).forEach(style => it(`'${style}' is a valid value in all letter cases`, () => {
			assert.deepEqual(cleanupStyleOption("fontVariant", style), style);
			assert.deepEqual(cleanupStyleOption("fontVariant", style.toLowerCase()), style.toLowerCase());
			assert.deepEqual(cleanupStyleOption("fontVariant", style.toUpperCase()), style.toUpperCase());
		}));

		describe("Other variant values are invalid and return undefined, also call error callback", () => {
			const testValues = Array.from(AllowedVariants.values()).map(x => x + '-invalid').concat([
				'',
				' ',
				'invalid',
			]);
			testValues.forEach(style => it(`'${style}'`, () => {
				assert.equal(cleanupStyleOption("fontVariant", style, errorCallback), undefined);
				assertError("fontVariant", style, `'${style}' is not a valid fontVariant value`);
			}));
		});
	});

	describe("color", () => {
		it('Supports word color names', () => {
			__isValidColor.callback = () => true;

			validCssColorNames.forEach(color => {
				assert.equal(cleanupStyleOption("color", color), color);
			});
		});
		it('Valid color spaces', () => {
			__isValidColor.callback = () => true;

			const values = [
				'#000',
				'#FFF',
				'#f0f0f0',
				'#0088fF',
				'rgb(0, 0, 0)',
				'rgb(1, 2, 8)',
				'rgb(255, 255, 255)',
				'rgba(0, 0, 0, 0)',
				'rgba(1, 2, 8, 0.5)',
				'rgba(255, 255, 255, 1)',
				'hsl(0, 0%, 100%)',
				'hsl(-213, 50%, 50%)',
				'hsl(3435, 100%, 0%)',
				'hsla(0, 0%, 100%, 0)',
				'hsla(-213, 50%, 50%, 0.5)',
				'hsla(3435, 100%, 0%, 1)',
			];

			values.forEach(color => {
				assert.equal(cleanupStyleOption("color", color), color);
			});
		});
		it('Invalid color spaces', () => {
			__isValidColor.callback = () => false;

			assert.equal(cleanupStyleOption("color", '#0033', errorCallback), undefined);
			assertError('color', '#0033', "'#0033' is not a valid hex color");
			assert.equal(cleanupStyleOption("color", '#00text', errorCallback), undefined);
			assertError('color', '#00text', "'#00text' is not a valid hex color");

			assert.equal(cleanupStyleOption("color", 'rgb(256,256,256)', errorCallback), undefined);
			assertError('color', 'rgb(256,256,256)', "'rgb(256,256,256)' is not a valid RGB color");

			assert.equal(cleanupStyleOption("color", 'rgba(1, 1, 1)', errorCallback), undefined);
			assertError('color', 'rgba(1, 1, 1)', "'rgba(1, 1, 1)' is not a valid RGBA color");

			assert.equal(cleanupStyleOption("color", 'hsl(0, 200%, 50%)', errorCallback), undefined);
			assertError('color', 'hsl(0, 200%, 50%)', "'hsl(0, 200%, 50%)' is not a valid HSL color");

			assert.equal(cleanupStyleOption("color", 'hsla(0, 50%, 50%, 3)', errorCallback), undefined);
			assertError('color', 'hsla(0, 50%, 50%, 3)', "'hsla(0, 50%, 50%, 3)' is not a valid HSLA color");
		});
	});

	describe("textAlign", () => {
		Array.from(AllowedTextAligns.values()).forEach(style => it(`'${style}' is a valid value in all letter cases`, () => {
			assert.equal(cleanupStyleOption("textAlign", style), style);
			assert.equal(cleanupStyleOption("textAlign", style.toLowerCase()), style.toLowerCase());
			assert.equal(cleanupStyleOption("textAlign", style.toUpperCase()), style.toUpperCase());
		}));
		describe("Other stretch values are invalid and return undefined, also call error callback", () => {
			const testValues = Array.from(AllowedStretches.values()).map(x => x + '-invalid').concat([
				'',
				' ',
				'invalid',
			]);
			testValues.forEach(style => it(`'${style}'`, () => {
				assert.equal(cleanupStyleOption("textAlign", style, errorCallback), undefined);
				assertError("textAlign", style, `'${style}' is not a valid textAlign value`);
			}));
		});
	});

	describe("whiteSpace", () => {
		Array.from(AllowedWhiteSpace.values()).forEach(style => it(`'${style}' is a valid value in all letter cases`, () => {
			assert.equal(cleanupStyleOption("whiteSpace", style), style);
			assert.equal(cleanupStyleOption("whiteSpace", style.toLowerCase()), style.toLowerCase());
			assert.equal(cleanupStyleOption("whiteSpace", style.toUpperCase()), style.toUpperCase());
		}));
		describe("Other stretch values are invalid and return undefined, also call error callback", () => {
			const testValues = Array.from(AllowedStretches.values()).map(x => x + '-invalid').concat([
				'',
				' ',
				'invalid',
			]);
			testValues.forEach(style => it(`'${style}'`, () => {
				assert.equal(cleanupStyleOption("whiteSpace", style, errorCallback), undefined);
				assertError("whiteSpace", style, `'${style}' is not a valid whiteSpace value`);
			}));
		});
	});

	describe("newLine", () => {
		Array.from(AllowedNewLines.values()).forEach(style => it(`'${style}' is a valid value in all letter cases`, () => {
			assert.equal(cleanupStyleOption("newLine", style), style);
			assert.equal(cleanupStyleOption("newLine", style.toLowerCase()), style.toLowerCase());
			assert.equal(cleanupStyleOption("newLine", style.toUpperCase()), style.toUpperCase());
		}));
		describe("Other stretch values are invalid and return undefined, also call error callback", () => {
			const testValues = Array.from(AllowedStretches.values()).map(x => x + '-invalid').concat([
				'',
				' ',
				'invalid',
			]);
			testValues.forEach(style => it(`'${style}'`, () => {
				assert.equal(cleanupStyleOption("newLine", style, errorCallback), undefined);
				assertError("newLine", style, `'${style}' is not a valid newLine value`);
			}));
		});
	});

	describe('spaceWidth', () => {
		it("Numbers with or without PX are valid", () => {
			assert.equal(cleanupStyleOption("spaceWidth", "14"), 14);
			assert.equal(cleanupStyleOption("spaceWidth", "7px"), 7);
			assert.equal(cleanupStyleOption("spaceWidth", "0.1px"), 0.1);
			assert.equal(cleanupStyleOption("spaceWidth", "+2"), 2);
			assert.equal(cleanupStyleOption("spaceWidth", "0"), 0);
			assert.equal(cleanupStyleOption("spaceWidth", "-4"), -4);
			assert.equal(cleanupStyleOption("spaceWidth", "-73px"), -73);
		});
		it("Different size types are invalid", () => {
			assert.equal(cleanupStyleOption("spaceWidth", "7pt"), undefined);
			assert.equal(cleanupStyleOption("spaceWidth", "7vw"), undefined);
			assert.equal(cleanupStyleOption("spaceWidth", "7%"), undefined);
			assert.equal(cleanupStyleOption("spaceWidth", "7vmax"), undefined);
		});
		it("Any other text is invalid", () => {
			assert.equal(cleanupStyleOption("spaceWidth", "seven"), undefined);
			assert.equal(cleanupStyleOption("spaceWidth", "smaller"), undefined);
			assert.equal(cleanupStyleOption("spaceWidth", "7.7.7"), undefined);
			assert.equal(cleanupStyleOption("spaceWidth", "3,14"), undefined);
			assert.equal(cleanupStyleOption("spaceWidth", ""), undefined);
		});
		it("Calls error callback on error", () => {
			cleanupStyleOption("spaceWidth", "invalid", errorCallback);
			assertError("spaceWidth", "invalid", "'invalid' is not a valid value for spaceWidth");
		});
	});
});

function assertError(field: string, value: string, error: string) {
	assert.equal(lastError.field, field);
	assert.equal(lastError.value, value);
	assert.equal(lastError.error, error);
}