import * as Sentry from "@sentry/node";
import { CommandInteraction } from "discord.js";
import { inspect } from "util";
import { analytics } from "../instrument.js";
import { getRollouts } from "../load.js";

export default async function (i: CommandInteraction) {
  Sentry;
  const rollouts = getRollouts();
  rollouts;
  analytics;

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
    const result = await eval(string);
    console.log(result);
    i.reply({
      content: `\`\`\`js\n${inspect(result, { depth: 4 })}\n\`\`\``,
    });
  } catch (e: any) {
    i.reply({
      content: `\`\`\`js\n${e.toString()}\n\`\`\``,
    });
    return { success: false, error: e };
  }

  return { success: true };
}
