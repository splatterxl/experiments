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
import { removeRolloutsPrefix } from "../util.js";

export default async function (i: CommandInteraction) {
  const id = removeRolloutsPrefix(i.options.get("id", true).value!.toString());

  if (rollouts.size === 0) {
    i.reply("Unexpected service interruption. Please try again later.");
    return;
  }

  let res: [ViewType, string];

  if (id === "all") {
    res = generateMultiExperimentRolloutCheck(
      i,
      checkMulti([...rollouts.values()], i.guildId!, i.guild!)
    );
  } else {
    const exp = rollouts.get(id);

    if (!exp) {
      i.reply("No experiment with that ID exists.");
      return;
    }

    const val = check(i.guildId!, exp, i.guild!);

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
      if (res[1].length < 17e2) {
        await i.reply({
          content: `${res[1]}${
            !i.guild
              ? "\n\n**IMPORTANT**: Your server might not qualify for this experiment. Please check the rollouts and overrides in the result of `/view ${id}` using the position calculated in the homepage to verify."
              : ""
          }`,
          components: [createDisclaimerComponent()],
        });
        break;
      }
    case ViewType.Attachment:
      await i.reply({
        content: !i.guild
          ? "Your server might not actually qualify for this experiment. Check the rollouts and overrides for your server (`/view <experiment_id>`) to verify."
          : undefined,
        files: [
          new AttachmentBuilder(Buffer.from(res[1]), {
            filename: `check-${id}-${i.guildId}.txt`,
            content_type: "text/plain"
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
