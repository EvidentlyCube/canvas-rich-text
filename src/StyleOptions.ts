export const AllowedStyles = new Set(['normal', 'italic']);
export const AllowedWeights = new Set(['100', '200', '300', '400', '500', '600', '700', '800', '900', 'normal', 'bold', 'lighter', 'bolder']);
export const AllowedVariants = new Set(['normal', 'small-caps']);
export const AllowedStretches = new Set(['ultra-condensed', 'extra-condensed', 'condensed', 'semi-condensed', 'normal', 'semi-expanded', 'expanded', 'extra-expanded', 'ultra-expanded']);

export type FontStyles = 'normal' | 'italic';
export type FontWeights = '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | 'normal' | 'bold' | 'lighter' | 'bolder';
export type FontVariants = 'normal' | 'small-caps';
export type FontStretches = 'ultra-condensed'
| 'extra-condensed'
| 'condensed'
| 'semi-condensed'
| 'normal'
| 'semi-expanded'
| 'expanded'
| 'extra-expanded'
| 'ultra-expanded';
export type TextAligns = 'left' | 'center' | 'right' | 'justify';

export interface StyleOptions {
	color: string;
	fontSize: string;
	fontFamily: string;
	fontStyle: FontStyles;
	fontWeight: FontWeights;
	fontVariant: FontVariants;
	fontStretch: FontStretches;

	width: number;
	textAlign: TextAligns;
	lineSpacing: number;
	whiteSpace: 'collapse-all'|'preserve-all'|'collapse-outer',
	spaceWidth: number;
}
