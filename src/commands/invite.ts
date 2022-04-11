import { OAuth2Scopes } from "discord-api-types/v10";
import { CommandInteraction } from "discord.js";

export default async function (i: CommandInteraction) {
  await i.reply(
    `<${i.client.generateInvite({
      scopes: [OAuth2Scopes.ApplicationsCommands],
    })}>`
  );

  return { success: true };
}
