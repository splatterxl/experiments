import type { APIApplicationCommandInteractionDataOption } from 'discord-api-types/v10.js';

export const optionsToJson = (
	options: APIApplicationCommandInteractionDataOption[]
): Record<string, string | number | boolean> => {
	const obj = {} as ReturnType<typeof optionsToJson>;

	for (const option of options) {
		// @ts-ignore
		obj[option.name] = option.value;
	}

	return obj;
};
