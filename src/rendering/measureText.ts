import {StyleOptions} from "../StyleOptions";
import {configureCanvas} from "./configureCanvas";

const canvas = typeof document !== 'undefined'
	? document.createElement('canvas')
	: undefined;
const canvasContext = canvas?.getContext('2d');

export function measureText(text: string, style: StyleOptions): TextMetrics {
	if (!canvasContext) {
		return {} as any;
	}

	configureCanvas(style, canvasContext);

	return canvasContext.measureText(text);
}