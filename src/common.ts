
export enum CanvasRichTextTokens {
	Text = 0,
	Newline = 1
}
export const AllowedStyles = new Set(['normal', 'italic']);
export const AllowedWeights = new Set(['100', '200', '300', '400', '500', '600', '700', '800', '900', 'normal', 'bold', 'lighter', 'bolder']);
export const AllowedVariants = new Set(['normal', 'small-caps', 'common-ligatures', 'no-common-ligatures', 'slashed-zero', 'proportional-nums', 'tabular-nums']);
export const AllowedStretches = new Set(['ultra-condensed', 'extra-condensed', 'condensed', 'semi-condensed', 'normal', 'semi-expanded', 'expanded', 'extra-expanded', 'ultra-expanded']);

export type FontStyles = 'normal' | 'italic';
export type FontWeights = '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | 'normal' | 'bold' | 'lighter' | 'bolder';
export type FontVariants = 'normal' | 'small-caps' | 'common-ligatures' | 'no-common-ligatures' | 'slashed-zero' | 'proportional-nums' | 'tabular-nums';
export type FontStretches =
	'ultra-condensed'
	| 'extra-condensed'
	| 'condensed'
	| 'semi-condensed'
	| 'normal'
	| 'semi-expanded'
	| 'expanded'
	| 'extra-expanded'
	| 'ultra-expanded';

