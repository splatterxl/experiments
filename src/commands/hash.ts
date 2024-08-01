import { CommandInteraction } from "discord.js";
import { murmur3 } from "../util.js";

export default async function (i: CommandInteraction) {
  const string = i.options.get("string", true).value as string;
  const hashed = murmur3(string);

  if (
    string ===
    "super secret string that literally just crashes the bot, pls do not use it's just for testing"
  ) {
    throw new Error("Crash test");
  }

  i.reply({
    content: `Murmur3: \`${hashed.toString()}\`\nRollout position: ${
      hashed % 10e3
    }`,
  });

  return { success: true };
}
