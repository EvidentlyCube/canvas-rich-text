import {
	AllowedLineHeights,
	AllowedNewLines,
	AllowedStretches,
	AllowedStyles,
	AllowedTextAligns,
	AllowedVariants,
	AllowedWeights,
	AllowedWhiteSpace as AllowedWhiteSpaces,
	StyleOptions,
} from "../StyleOptions";

// Checks if the format is [+/-]<number>[.<number>][px]
const validateFontSize = /^[+]?[0-9]+(?:[.][0-9]+)?(?:px)?$/;
const trimForFontSize = /[^0-9.]/g;

const validateOtherSize = /^[+-]?[0-9]+(?:[.][0-9]+)?(?:px)?$/;
const trimForOtherSize = /[^0-9.-]/g;

export const validCssColorNames = new Set([
	'aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure',
	'beige', 'bisque', 'black', 'blanchedalmond', 'blue', 'blueviolet', 'brown', 'burlywood',
	'cadetblue', 'chartreuse', 'chocolate', 'coral', 'cornflowerblue', 'cornsilk', 'crimson', 'cyan',
	'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray', 'darkgrey', 'darkgreen', 'darkkhaki', 'darkmagenta', 'darkolivegreen', 'darkorange',
	'darkorchid', 'darkred', 'darksalmon', 'darkseagreen', 'darkslateblue', 'darkslategray', 'darkslategrey', 'darkturquoise', 'darkviolet',
	'deeppink', 'deepskyblue', 'dimgray', 'dimgrey', 'dodgerblue',
	'firebrick', 'floralwhite', 'forestgreen', 'fuchsia',
	'gainsboro', 'ghostwhite', 'gold', 'goldenrod', 'gray', 'grey', 'green', 'greenyellow',
	'honeydew', 'hotpink',
	'indianred ', 'indigo ', 'ivory',
	'khaki',
	'lavender', 'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue', 'lightcoral', 'lightcyan', 'lightgoldenrodyellow',
	'lightgray', 'lightgrey', 'lightgreen', 'lightpink', 'lightsalmon', 'lightseagreen', 'lightskyblue', 'lightslategray',
	'lightslategrey', 'lightsteelblue', 'lightyellow', 'lime', 'limegreen', 'linen',
	'magenta', 'maroon', 'mediumaquamarine', 'mediumblue', 'mediumorchid', 'mediumpurple', 'mediumseagreen', 'mediumslateblue',
	'mediumspringgreen', 'mediumturquoise', 'mediumvioletred', 'midnightblue', 'mintcream', 'mistyrose', 'moccasin',
	'navajowhite', 'navy',
	'oldlace', 'olive', 'olivedrab', 'orange', 'orangered', 'orchid',
	'palegoldenrod', 'palegreen', 'paleturquoise', 'palevioletred', 'papayawhip', 'peachpuff', 'peru', 'pink', 'plum', 'powderblue', 'purple',
	'red', 'rosybrown', 'royalblue',
	'saddlebrown', 'salmon', 'sandybrown', 'seagreen', 'seashell', 'sienna', 'silver', 'skyblue',
	'slateblue', 'slategray', 'slategrey', 'snow', 'springgreen', 'steelblue',
	'tan', 'teal', 'thistle', 'tomato', 'turquoise',
	'violet',
	'wheat', 'white', 'whitesmoke',
	'yellow',
	'yellowgreen',
]);

type CleanupStyleWarningCallback = (field: string, value: string, error: string) => void;


function isValidColor(color: string) {
	if (typeof Option !== 'undefined') {
		const s = new Option().style;
		s.color = color;
		return s.color !== '';
	} else {
		return __isValidColor.callback();
	}
}

export const __isValidColor = {
	callback: (): boolean => false,
};

export function cleanupStyleOption<T extends keyof StyleOptions>(
	field: T,
	value: string,
	errorCallback?: CleanupStyleWarningCallback,
): string | number | undefined {
	switch (field) {
		case "color":
			if (validCssColorNames.has(value.toLowerCase())) {
				return value;
			}

			if (value.charAt(0) === '#') {
				if (!isValidColor(value)) {
					errorCallback?.(field, value, `'${value}' is not a valid hex color`);
					return undefined;
				}
				return value;
			}

			const first4 = value.substr(0, 4).toLowerCase();
			switch (first4) {
				case('rgb('):
					if (!isValidColor(value)) {
						errorCallback?.(field, value, `'${value}' is not a valid RGB color`);
						return undefined;
					}
					return value;

				case('hsl('):
					if (!isValidColor(value)) {
						errorCallback?.(field, value, `'${value}' is not a valid HSL color`);
						return undefined;
					}
					return value;

				case('rgba'):
					if (!isValidColor(value)) {
						errorCallback?.(field, value, `'${value}' is not a valid RGBA color`);
						return undefined;
					}
					return value;

				case('hsla'):
					if (!isValidColor(value)) {
						errorCallback?.(field, value, `'${value}' is not a valid HSLA color`);
						return undefined;
					}
					return value;
			}

			errorCallback?.(field, value, `'${value}' is not a valid color name`);
			return undefined;
		case "fontSize":
			if (!validateFontSize.test(value)) {
				errorCallback?.(field, value, `'${value}' is not a valid value for fontSize`);
				return undefined;
			}

			const fontSize = parseFloat(value.replace(trimForFontSize, ''));

			if (fontSize <= 0) {
				errorCallback?.(field, value, 'fontSize must be larger than 0');
				return undefined;
			}
			return fontSize;

		case "fontFamily":
			if (value.length === 0) {
				errorCallback?.(field, value, 'fontFamily cannot be empty');
				return undefined;
			}

			return value;

		case "fontStyle":
			if (!AllowedStyles.has(value.toLowerCase())) {
				errorCallback?.(field, value, `'${value}' is not a valid fontStyle value`);
				return undefined;
			}

			return value;

		case "fontWeight":
			if (!AllowedWeights.has(value.toLowerCase())) {
				errorCallback?.(field, value, `'${value}' is not a valid fontWeight value`);
				return undefined;
			}

			return value;

		case "fontVariant":
			if (!AllowedVariants.has(value.toLowerCase())) {
				errorCallback?.(field, value, `'${value}' is not a valid fontVariant value`);
				return undefined;
			}

			return value;

		case "fontStretch":
			if (!AllowedStretches.has(value.toLowerCase())) {
				errorCallback?.(field, value, `'${value}' is not a valid fontStretch value`);
				return undefined;
			}

			return value;

		case "textAlign":
			if (!AllowedTextAligns.has(value.toLowerCase())) {
				errorCallback?.(field, value, `'${value}' is not a valid textAlign value`);
				return undefined;
			}

			return value;

		case "whiteSpace":
			if (!AllowedWhiteSpaces.has(value.toLowerCase())) {
				errorCallback?.(field, value, `'${value}' is not a valid whiteSpace value`);
				return undefined;
			}

			return value;

		case "newLine":
			if (!AllowedNewLines.has(value.toLowerCase())) {
				errorCallback?.(field, value, `'${value}' is not a valid newLine value`);
				return undefined;
			}

			return value;

		case "lineHeight":
			if (!AllowedLineHeights.has(value.toLowerCase())) {
				errorCallback?.(field, value, `'${value}' is not a valid lineHeight value`);
				return undefined;
			}

			return value;

		case "spaceWidth":
			if (!validateOtherSize.test(value)) {
				errorCallback?.(field, value, `'${value}' is not a valid value for spaceWidth`);
				return undefined;
			}

			return parseFloat(value.replace(trimForOtherSize, ''));

		case "lineSpacing":
			if (!validateOtherSize.test(value)) {
				errorCallback?.(field, value, `'${value}' is not a valid value for lineSpacing`);
				return undefined;
			}

			return parseFloat(value.replace(trimForOtherSize, ''));
	}

	return undefined;
}