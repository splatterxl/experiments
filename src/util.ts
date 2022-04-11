import {
	InteractionReplyOptions,
	Message,
	MessageComponentInteraction,
	CommandInteraction
} from 'discord.js';
import {
	ButtonStyle,
	ComponentType,
	OAuth2Scopes,
	Routes
} from 'discord-api-types/v10';
import murmur32 from 'murmur-32';

export async function editMessage(
	i: MessageComponentInteraction,
	data: InteractionReplyOptions
) {
	const message =
		i.message instanceof Message
			? i.message
			: await i.client.rest
					.get(Routes.channelMessage(i.channelId, i.message.id))
					.then((d) => {
						// @ts-ignore
						return new Message(i.client, d as any);
					});

	await message.edit(data);
}

export function murmur3(str: string) {
	return parseInt(Buffer.from(murmur32(str)).toString('hex'), 16);
}

export function pad(len: number, str: string) {
	if (str.length >= len) return str;

	return str.padStart(len, ' ');
}

export function ol(...args: any[]) {
	return args
		.map((a, i) => `\`${pad(`${args.length}.`.length, `${i + 1}.`)}\` ${a}`)
		.join('\n');
}

export function mapOl(v: any, i: number, m: any[]) {
	return `\`${pad(`${m.length}.`.length, `${i + 1}.`)}\` ${v}`;
}

export function replyIfNotGuild(i: CommandInteraction) {
	if (i.guildId === null || i.guild === null) {
		return (
			i.reply({
				embeds: [
					{
						color: 0xffcc00,
						title: 'Guild-only command',
						description:
							'It looks like you tried to use a command that is only available in guilds, but you added me without the `bot` scope.'
					}
				],
				components: [
					{
						type: ComponentType.ActionRow,
						components: [
							{
								type: ComponentType.Button,
								style: ButtonStyle.Link,
								url: i.client.generateInvite({
									scopes: [OAuth2Scopes.Bot]
								}),
								label: 'Re-invite me'
							}
						]
					}
				]
			}),
			true
		);
	}
}
