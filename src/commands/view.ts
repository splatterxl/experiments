import {
	APIChatInputApplicationCommandInteraction,
	APIInteractionResponse,
	InteractionResponseType
} from 'discord-api-types/v10.js';

export function view(
	{ id }: { id: string },
	interaction: APIChatInputApplicationCommandInteraction
): APIInteractionResponse {
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: id
		}
	};
}
