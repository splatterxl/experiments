import { CommandInteraction, SelectMenuInteraction } from "discord.js";
import { rollouts } from "..";
import { notFound } from "../events/interactionCreate";
import { renderExperimentHomeView, renderRolloutView } from "../experiment";
import { editMessage } from "../util";

export default function (i: CommandInteraction) {
  if (rollouts.size === 0) {
    i.reply("Unexpected service interruption. Please try again later.");
    return { success: false, error: "rollouts unavailable" };
  }

  const id = i.options.get("id", true).value!.toString();

  if (!rollouts.has(id)) {
    i.reply("That rollout does not exist.");
    return { success: false, error: "rollout not found" };
  }

  i.reply(renderExperimentHomeView(i, id));

  return { success: true };
}

export async function handleComponent (i: SelectMenuInteraction) {
  const [page, id] = i.values[0].split(",");

  switch (page) {
    case "home":
      await i.deferUpdate();
      await editMessage(i, renderExperimentHomeView(i, id));
      break;
    case "rollout":
      await i.deferUpdate();
      await editMessage(i, renderRolloutView(i, id));
      break;
    default:
      notFound(i);
      break;
  }
}
