import {
  ComponentType,
  GuildHubType,
  MessageFlags,
  OAuth2Scopes,
  Routes,
} from "discord-api-types/v10";
import {
  ButtonStyle,
  CacheType,
  Client,
  CommandInteraction,
  InteractionReplyOptions,
  Message,
  MessageComponentInteraction,
} from "discord.js";
import murmur from "murmurhash";

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

export function murmur3(...strs: string[]) {
  return murmur.v3(strs.join(":"));
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
    return `${i + idx + 1}. ${v}`;
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

/**
 * Deduplicates an array
 */
export function dedupe(arr: any[]) {
  return [...new Set(arr)];
}

/**
 * Returns the string with rollouts.advaith.io hostname removed.
 */
export function removeRolloutsPrefix(str: string) {
  return str.replace(/^https:\/\/rollouts.advaith.io\/#/, "");
}

export interface CheckableGuild {
  id: string;
  name?: string;
  features?: string[];
  memberCount?: number;
  vanityURLCode?: string | null;
  hubType?: GuildHubType;

  source?: "cache" | "preview" | "widget" | "mee6" | "servus";
}

/**
 * Given a guild id, tries many different ways to get the guild object. (id, name, )
 */
export async function getGuild(
  id: string,
  client: Client
): Promise<CheckableGuild | null> {
  let guild: CheckableGuild | null = null;

  try {
    guild = await client.guilds.fetch(id);
    if (guild) guild.source = "cache";
  } catch {}

  if (!guild)
    try {
      guild = await client.fetchGuildPreview(id);
      if (guild) guild.source = "preview";

      console.debug("preview", guild);
    } catch {}

  if (!guild)
    try {
      guild = await client.fetchGuildWidget(id);
      if (guild) guild.source = "widget";

      console.debug("widget", guild);
    } catch {}

  if (!guild)
    try {
      guild = await fetch(
        "https://mee6.xyz/api/plugins/levels/leaderboard/" + id + "?limit=1"
      )
        .then((res) => res.json() as any)
        .then((res) => res.guild);
      if (guild) guild.source = "mee6";

      console.debug("mee6", guild);
    } catch {}

  if (!guild && process.env.SERVUS_URL)
    try {
      guild = await fetch(process.env.SERVUS_URL + "/api/guilds/" + id)
        .then((res) => res.json() as any)
        .then((res) => res.guild);
      if (guild) guild.source = "servus";

      console.debug("servus", guild);
    } catch {}

  // done
  return guild ?? null;
}

/** @deprecated */
export function getGuildName(id: string) {
  return null;
}

export const __DEV__ = process.env.NODE_ENV === "development";
