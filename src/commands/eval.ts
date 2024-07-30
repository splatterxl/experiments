import * as Sentry from "@sentry/node";
import { CommandInteraction } from "discord.js";
import { inspect } from "util";
import { rollouts } from "../load.js";

export default async function (i: CommandInteraction) {
  Sentry;
  rollouts;

  const string = i.options.get("code", true).value as string;

  if (!process.env.OWNER_ID) {
    i.reply({
      content: "Owner ID not set",
      ephemeral: true,
    });
    return { success: false, error: "Owner ID not set" };
  }

  if (i.user.id !== process.env.OWNER_ID) {
    i.reply({
      content: "Nope",
      ephemeral: true,
    });
    return { success: false, error: "not owner" };
  }

  try {
    const result = eval(string);
    console.log(result);
    i.reply({
      content: `\`\`\`js\n${inspect(result, { depth: 4 })}\n\`\`\``,
    });
  } catch (e) {
    i.reply({
      content: `\`\`\`js\n${e.toString()}\n\`\`\``,
    });
    return { success: false, error: e };
  }

  return { success: true };
}
