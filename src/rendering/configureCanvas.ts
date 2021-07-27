import {StyleOptions} from "../StyleOptions";

export function configureCanvas(style: StyleOptions, target: CanvasRenderingContext2D) {
	const font = `${style.fontStyle} ${style.fontVariant} ${style.fontWeight} ${style.fontStretch} ${style.fontSize} ${style.fontFamily}`
		.replace(/normal /g, '');
	target.font = font;
	target.textBaseline = 'alphabetic';
	target.fillStyle = style.color;
}