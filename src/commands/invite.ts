import { CommandInteraction, OAuth2Scopes } from "discord.js";

export default async function (i: CommandInteraction) {
  await i.reply(`<${i.client.generateInvite({
    scopes: [OAuth2Scopes.ApplicationsCommands, OAuth2Scopes.Bot],
  })}>`);

  return { success: true };
}
