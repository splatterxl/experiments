import { ButtonInteraction, CommandInteraction } from "discord.js";

// TODO: update this to check all the experiments

export default async function (i: CommandInteraction) {
  i.reply("This command isn't functional right now, please try again later.");

  return { success: true };

  // const l = list();

  // await i.reply(makeListReply(i as any, l, 0));
  // return { success: true };
}

export function handleComponent(
  i: ButtonInteraction,
  command: "prev" | "next",
  idx: string
) {
  // noop
}
