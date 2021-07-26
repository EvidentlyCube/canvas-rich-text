import {FontStretches, FontStyles, FontVariants, FontWeights} from "./common";

export interface StyleOptions {
	fontSize: string;
	fontFamily: string;
	fontStyle: FontStyles;
	fontWeight: FontWeights;
	fontVariant: FontVariants[];
	fontStretch: FontStretches;
}

