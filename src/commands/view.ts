import { CommandInteraction } from "discord.js";
import { rollouts } from "..";
import { Filter, FilterType } from "../experiment";

const andList = new Intl.ListFormat()
const orList = new Intl.ListFormat({ style: "unit", type: "disjunction" })

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

  const exp = rollouts.get(id)!;

  const filters = exp.rollout[3].map(rollout => {
    return rollout[1].map(f => parseFilter(f));
  });

  i.reply({
    embeds: [{
      title: `${exp.data.title} (${exp.data.id})`,
      description: exp.data.description.join("\n"),
      fields: [
        {
          name: "Override filters",
          value: filters.length ? filters.map(v => v.join("\n")).join("") || "None" : "None",
          inline: true
        }
      ]
    }]
  });

  return { success: true };
}

const parseFilter = (f: Filter) => {
	if (f[0] === FilterType.Feature) return `Server has feature ${orList.format(f[1][0][1])}`;
	if (f[0] === FilterType.IDRange) return `Server ID is in range ${f[1][0][1] ?? 0} - ${f[1][1][1]}`;
	if (f[0] === FilterType.MemberCount) return `Server member count is ${f[1][1][1] ? `in range ${f[1][0][1] ?? 0} - ${f[1][1][1]}` : `${f[1][0][1]}+`}`;
	if (f[0] === FilterType.ID) return `Server ID is ${orList.format(f[1][0][1])}`;
	if (f[0] === FilterType.HubType) return `Server hub type is ${orList.format(f[1][0][1].map(t => t.toString()))}`;
	return `Unknown filter type ${f[0]}`;
}
