import {StyleOptions} from "./StyleOptions";

/**
 * The default style. You can modify this to affect how the text will be rendered.
 */
export const defaultStyle: StyleOptions = {
	color: 'black',
	fontSize: '14px',
	fontStyle: 'normal',
	fontVariant: 'normal',
	fontWeight: 'normal',
	fontStretch: 'normal',
	fontFamily: 'arial, sans-serif',

	width: Number.MAX_SAFE_INTEGER,
	textAlign: "left",
	lineSpacing: 5,
	whiteSpace: "collapse-all",
	spaceWidth: 5,
	newLine: 'preserve'
};