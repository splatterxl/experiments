import {
  ButtonStyle,
  ComponentType,
  MessageFlags,
  OAuth2Scopes,
  Routes,
} from "discord-api-types/v10";
import {
  CacheType,
  CommandInteraction,
  InteractionReplyOptions,
  Message,
  MessageComponentInteraction,
} from "discord.js";
import{v3} from "murmurhash";

export async function editMessage(
  i: MessageComponentInteraction<CacheType>,
  data: InteractionReplyOptions
) {
  const message: Message = await i.client.rest
    .get(Routes.channelMessage(i.channelId, i.message.id))
    .then((d) => {
      // @ts-ignore
      return new Message(i.client, d as any);
    });

  if (message.flags.has(MessageFlags.SuppressEmbeds) && data.embeds?.length) {
    await i.reply({
      content: "This message has embeds suppressed.",
      ephemeral: true,
    });
    return;
  }

  try {
    await message.edit(data as any);
    return i.deferUpdate();
  } catch (e) {
    await i.reply({
      content: `I couldn't update the message. \`\`\`js\n${e}\n\`\`\``,
      ephemeral: true,
    });
  }
}

export function murmur3(str: string) {
  return v3(str);
}

export function pad(len: number, str: string) {
  if (str.length >= len) return str;

  return str.padStart(len, " ");
}

export function ol(...args: any[]) {
  return args
    .map((a, i) => `\`${pad(`${args.length}.`.length, `${i + 1}.`)}\` ${a}`)
    .join("\n");
}

export function mapOl(v: any, i: number, m: any[]) {
  return `\`${pad(`${m.length}.`.length, `${i + 1}.`)}\` ${v}`;
}

export function mapOlPlus(idx: number) {
  return (v: any, i: number, m: any[]) => {
    return `\`${pad(`${idx + m.length}.`.length, `${i + idx + 1}.`)}\` ${v}`;
  };
}

export function replyIfNotGuild(i: CommandInteraction) {
  if (i.guildId === null || i.guild === null) {
    return (
      i.reply({
        embeds: [
          {
            color: 0xffcc00,
            title: "Guild-only command",
            description:
              "It looks like you tried to use a command that is only available in guilds, but you added me without the `bot` scope.",
          },
        ],
        components: [
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.Button,
                style: ButtonStyle.Link,
                url: i.client.generateInvite({
                  scopes: [OAuth2Scopes.Bot],
                }),
                label: "Re-invite me",
              },
            ],
          },
        ],
      }),
      true
    );
  }
}

export function dedupe(arr: any[]) {
  return [...new Set(arr)];
}

export function removeRolloutsPrefix(str: string) {
  return str.replace(/^https:\/\/rollouts.advaith.io\/#/, "");
}
