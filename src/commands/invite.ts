import { CommandInteraction } from "discord.js";

export default async function (i: CommandInteraction) {
  await i.reply(
    `<https://discord.com/oauth2/authorize?client_id=${i.client.user!.id}>`
  );

  return { success: true };
}
