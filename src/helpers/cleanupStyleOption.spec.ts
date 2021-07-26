import {assert} from "chai";
import {describe, it} from 'mocha';
import {cleanupStyleOption} from "./cleanupStyleOption";
import {AllowedStretches, AllowedStyles, AllowedVariants, AllowedWeights} from "../common";

let lastError = {
	field: "",
	value: "",
	error: "",
};
let errorCallback = (field: string, value: string, error: string) => lastError = {field, value, error};

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
		describe("Single values", () => {
			Array.from(AllowedVariants.values()).forEach(style => it(`'${style}' is a valid value in all letter cases`, () => {
				assert.deepEqual(cleanupStyleOption("fontVariant", style), [style]);
				assert.deepEqual(cleanupStyleOption("fontVariant", style.toLowerCase()), [style.toLowerCase()]);
				assert.deepEqual(cleanupStyleOption("fontVariant", style.toUpperCase()), [style.toUpperCase()]);
			}));
		});
		describe("Multiple values", () => {
			Array.from(AllowedVariants.values()).forEach(style1 => {
				Array.from(AllowedVariants.values()).forEach(style2 => {
					if (style1 === style2) {
						return; // Multiple identical values are handled somewhere else
					}

					it(`'${style1} ${style2}' is a valid value in all letter cases`, () => {
						assert.deepEqual(cleanupStyleOption("fontVariant", `${style1} ${style2}`), [style1, style2]);
						assert.deepEqual(cleanupStyleOption("fontVariant", `${style1} ${style2}`.toLowerCase()), [style1.toLowerCase(), style2.toLowerCase()]);
						assert.deepEqual(cleanupStyleOption("fontVariant", `${style1} ${style2}`.toUpperCase()), [style1.toUpperCase(), style2.toUpperCase()]);
					});
				});
			});
		});
		describe("Errors and invalid values", () => {
			it("Multiple identical values are removed and reported", () => {
				assert.deepEqual(cleanupStyleOption("fontVariant", `small-caps small-caps`, errorCallback), ['small-caps']);
				assertError('fontVariant', 'small-caps small-caps', "'small-caps' has appeared multiple times in fontVariant");
			});

			it("Invalid values are removed and reported", () => {
				assert.deepEqual(cleanupStyleOption("fontVariant", `small-caps invalid`, errorCallback), ['small-caps']);
				assertError('fontVariant', 'small-caps invalid', "'invalid' is not a valid fontVariant value and it was removed");
			})

			it("Invalid values are removed and reported", () => {
				assert.deepEqual(cleanupStyleOption("fontVariant", `wrong invalid`, errorCallback), undefined);
				assertError('fontVariant', 'wrong invalid', "No valid fontVariant value remained");
			});
		});
	});
});

function assertError(field: string, value: string, error: string) {
	assert.equal(lastError.field, field);
	assert.equal(lastError.value, value);
	assert.equal(lastError.error, error);
}