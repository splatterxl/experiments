import { AttachmentBuilder, CommandInteraction } from "discord.js";
import { check, checkMulti } from "../experiment.js";
import { rollouts } from "../index.js";
import {
  createDisclaimerComponent,
  generateMultiExperimentRolloutCheck,
  orList,
  treatment,
  ViewType,
} from "../render.js";
import { removeRolloutsPrefix, replyIfNotGuild } from "../util.js";

export default async function (i: CommandInteraction) {
  if (replyIfNotGuild(i)) return;

  const id = removeRolloutsPrefix(i.options.get("id", true).value!.toString());

  if (rollouts.size === 0) {
    i.reply("Unexpected service interruption. Please try again later.");
    return;
  }

  let res: [ViewType, string];

  if (id === "all") {
    res = generateMultiExperimentRolloutCheck(
      i,
      checkMulti([...rollouts.values()], i.guild!)
    );
  } else {
    const exp = rollouts.get(id);

    if (!exp) {
      i.reply("No experiment with that ID exists.");
      return;
    }

    const val = check(i.guild!, exp);

    if (val.active) {
      res = [
        ViewType.Content,
        `
        Experiment \`${id}\` **is active** in this guild. 

        ${
          val.overrides.length > 0
            ? `
          Overrides: ${val.overrides.map(treatment).join(", ")} 
        `
            : ""
        }
        ${
          val.populations.length > 0
            ? `
          Matched populations:
            - ${val.populations
              .map((p) => {
                const t = treatment(p.bucket);

                return `${p.name || "Global"} (${orList.format(
                  p.cond.map(({ s, e }) => `${s}..${e}`)
                )}): ${t}`;
              })
              .join("\n - ")}
        `
            : ""
        }
      `.replace(/(\n+)\s+/g, "$1"),
      ];
    } else {
      res = [
        ViewType.Content,
        `Experiment \`${id}\` **is not active** in this guild.`,
      ];
    }
  }

  switch (res[0]) {
    case ViewType.Content:
      await i.reply({
        content: res[1],
        components: [createDisclaimerComponent()],
      });
      break;
    case ViewType.Attachment:
      await i.reply({
        files: [
          new AttachmentBuilder(res[1], {
            name: `check-${id}-${i.guildId}.txt`,
          }),
        ],
        components: [createDisclaimerComponent()],
      });
      break;
    default:
      throw new Error("Unexpected view type: " + res[0]);
  }

  return { success: true };
}
