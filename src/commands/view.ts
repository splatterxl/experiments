import { CommandInteraction, SelectMenuInteraction } from "discord.js";
import { rollouts } from "../index.js";
import { renderExperimentHomeView, renderRolloutView, renderOverrideView } from "../experiment.js";
import { editMessage } from "../util.js";

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

  i.reply(getViewForPage(i.options.get("page", false)?.value!.toString() ?? "home")(i, id));

  return { success: true };
}

export async function handleComponent (i: SelectMenuInteraction) {
  const [page, id] = i.values[0].split(",");

  await i.deferUpdate();
  await editMessage(i, getViewForPage(page)(i, id));
}

function getViewForPage(p: string) {
  switch (p) {
    case "home":
      return renderExperimentHomeView;
    case "rollout":
      return renderRolloutView;
    case "overrides":
      return renderOverrideView;
    default:
      return () => ({ content: "Not found" });
  }
}
