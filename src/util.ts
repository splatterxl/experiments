import { InteractionReplyOptions, Message, MessageComponentInteraction } from "discord.js";
import { Routes } from "discord-api-types/v10";

export async function editMessage(i: MessageComponentInteraction, data: InteractionReplyOptions) {
  const message = i.message instanceof Message ? i.message : await i.client.rest.get(Routes.channelMessage(i.channelId, i.message.id)).then(d => {
    // @ts-ignore
    return new Message(i.client, d as any)
  });

  await message.edit(data);
}
