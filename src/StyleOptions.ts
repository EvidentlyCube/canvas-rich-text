import {AllowedStretches, AllowedStyles, AllowedVariants, AllowedWeights, FontStretches, FontStyles, FontVariants, FontWeights} from "./common";

export interface StyleOptions {
	fontSize: string;
	fontFamily: string;
	fontStyle: FontStyles;
	fontWeight: FontWeights;
	fontVariant: FontVariants[];
	fontStretch: FontStretches;
}

const trimNonNumbersRegexp = /[^0-9.]/g;

export function cleanupStyleOption<T extends keyof StyleOptions>(field: T, value: string): string|string[]|undefined {
	switch (field) {
		case "fontSize":
			const fontSize = parseFloat(value.replace(trimNonNumbersRegexp, ''));
			return Number.isNaN(fontSize) || fontSize <= 0
				? undefined
				: `${fontSize}px`;
		case "fontFamily":
			return value.length > 0
				? value
				: undefined;
		case "fontStyle":
			value = value.toLowerCase();
			return AllowedStyles.indexOf(value) !== -1
				? value
				: undefined;
		case "fontWeight":
			value = value.toLowerCase();
			return AllowedWeights.indexOf(value) !== -1
				? value
				: undefined;
		case "fontVariant":
			value = value.toLowerCase();
			const bits = value.split(' ').filter(val => AllowedVariants.indexOf(val) !== -1);
			return bits.length > 0
				? bits
				: undefined;
		case "fontStretch":
			value = value.toLowerCase();
			return AllowedStretches.indexOf(value) !== -1
				? value
				: undefined;
	}

	return undefined;
}