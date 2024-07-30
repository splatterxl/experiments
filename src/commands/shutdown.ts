import { CommandInteraction } from "discord.js";

export default async function (i: CommandInteraction) {
  const environment = i.options.get("environment", true);

  if (environment.value !== process.env.NODE_ENV) {
    return { success: false, error: "environment mismatch" };
  }

  await i.reply("Good night! 😴");

  process.exit(0);
}
