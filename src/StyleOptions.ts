export const AllowedStyles = new Set(['normal', 'italic']);
export const AllowedWeights = new Set(['100', '200', '300', '400', '500', '600', '700', '800', '900', 'normal', 'bold', 'lighter', 'bolder']);
export const AllowedVariants = new Set(['normal', 'small-caps']);
export const AllowedStretches = new Set(['ultra-condensed', 'extra-condensed', 'condensed', 'semi-condensed', 'normal', 'semi-expanded', 'expanded', 'extra-expanded', 'ultra-expanded']);
export const AllowedTextAligns = new Set(['left', 'center', 'right']);
export const AllowedWhiteSpace = new Set(['collapse-all', 'collapse-outer']);
export const AllowedNewLines = new Set(['space', 'ignore', 'preserve']);

export type FontStyle = 'normal' | 'italic';
export type FontWeight = '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | 'normal' | 'bold' | 'lighter' | 'bolder';
export type FontVariant = 'normal' | 'small-caps';
export type FontStretch = 'ultra-condensed'
| 'extra-condensed'
| 'condensed'
| 'semi-condensed'
| 'normal'
| 'semi-expanded'
| 'expanded'
| 'extra-expanded'
| 'ultra-expanded';
export type TextAlign = 'left' | 'center' | 'right';
export type WhiteSpace = 'collapse-all'|'collapse-outer';
export type NewLine = 'space'|'ignore'|'preserve';

export interface StyleOptions {
	color: string;
	fontSize: string;
	fontFamily: string;
	fontStyle: FontStyle;
	fontWeight: FontWeight;
	fontVariant: FontVariant;
	fontStretch: FontStretch;

	width: number;
	textAlign: TextAlign;
	lineSpacing: number;
	whiteSpace: WhiteSpace,
	spaceWidth: number;
	newLine: NewLine;
}