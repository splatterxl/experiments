import { CommandInteraction } from "discord.js";
import { loadRollouts } from "../load.js";

export default async function (i: CommandInteraction) {
  loadRollouts();

  await i.reply("Refetch queued.");

  return { success: true };
}
