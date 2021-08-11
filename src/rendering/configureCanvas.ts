import {StyleOptions} from "../StyleOptions";

export function configureCanvas(style: StyleOptions, target: CanvasRenderingContext2D): void {
	target.font = `${style.fontStyle} ${style.fontVariant} ${style.fontWeight} ${style.fontStretch} ${style.fontSize}px ${style.fontFamily}`;
	target.textBaseline = 'alphabetic';
	target.fillStyle = style.color;
}