import { CommandInteraction, SelectMenuInteraction } from "discord.js";
import {
  renderExperimentHomeView,
  renderOverrideView,
  renderRolloutView,
} from "../experiment.js";
import { rollouts } from "../index.js";
import { editMessage, removeRolloutsPrefix } from "../util.js";

export default async function (i: CommandInteraction) {
  if (rollouts.size === 0) {
    await i.reply("Unexpected service interruption. Please try again later.");
    return { success: false, error: "rollouts unavailable" };
  }

  const id = removeRolloutsPrefix(i.options.get("id", true).value!.toString());

  if (!rollouts.has(id)) {
    await i.reply("That rollout does not exist.");
    return { success: false, error: "rollout not found" };
  }

  await i.reply(
    getViewForPage(i.options.get("page", false)?.value!.toString() ?? "home")(
      i,
      id
    )
  );

  return { success: true };
}

export async function handleComponent(i: SelectMenuInteraction) {
  const [page, id] = i.values[0].split(",");

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
