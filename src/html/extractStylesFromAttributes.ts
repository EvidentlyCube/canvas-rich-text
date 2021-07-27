import {StyleOptions} from "../StyleOptions";
import {cleanupStyleOption} from "../helpers/cleanupStyleOption";

export function extractStylesFromAttributes(
	attributes: Record<string, string>,
	attributeToStyleMap: Record<string, keyof StyleOptions>,
): Partial<StyleOptions> {
	const result: Partial<StyleOptions> = {};

	for (const attribute in attributes) {
		if (!attributes.hasOwnProperty(attribute)) {
			continue;
		}

		const attributeLC = attribute.toLowerCase();
		if (attributeToStyleMap.hasOwnProperty(attributeLC)) {
			const attributeName = attributeToStyleMap[attributeLC];
			const value = cleanupStyleOption(attributeName, attributes[attribute]);
			if (value !== undefined) {
				// Casting to any to avoid painful type juggling. We trust `cleanupStyleOption` returns correct
				result[attributeName] = value as any;
			}
		}
	}

	return result;
}
