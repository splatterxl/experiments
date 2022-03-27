import { InteractionReplyOptions, Message, MessageComponentInteraction } from "discord.js";
import { Routes } from "discord-api-types/v10"; 
import murmur32 from "murmur-32";

export async function editMessage(i: MessageComponentInteraction, data: InteractionReplyOptions) {
  const message = i.message instanceof Message ? i.message : await i.client.rest.get(Routes.channelMessage(i.channelId, i.message.id)).then(d => {
    // @ts-ignore
    return new Message(i.client, d as any)
  });

  await message.edit(data);
}

export function murmur3(str: string) {
  return parseInt(Buffer.from(murmur32(str)).toString("hex"), 16)
}

export function pad(len: number, str: string) {
  if (str.length >= len) return str;

  return str.padStart(len, " ");
}

export function ol(...args: any[]) {
  return args.map((a, i) => `\`${pad(`${args.length}.`.length, `${i + 1}.`)}\` ${a}`).join("\n");
}

export function mapOl(v: any, i: number, m: any[]) {
  return `\`${pad(`${m.length}.`.length, `${i + 1}.`)}\` ${v}`;
}
