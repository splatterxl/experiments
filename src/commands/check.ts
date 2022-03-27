import { CommandInteraction, MessageAttachment } from "discord.js";
import { check } from "../experiment.js";
import { rollouts } from "../index.js";
import { orList, treatment } from "../render.js";

export default async function (i: CommandInteraction) {
  const id = i.options.get("id", true).value!.toString();

  if (rollouts.size === 0) {
    i.reply("Unexpected service interruption. Please try again later.");
    return;
  }

  if (id === "all") {
    const res: { active: boolean; treatment: number[]; id: string; }[] = [];

    for (const exp of rollouts.values()) {
      const val = check(i.guild!, exp);

      if (val.active) {
        res.push({
          active: true,
          treatment: val.overrides.concat(val.populations.map(v => v.bucket)),
          id: exp.data.id,
        });
      }
    }

    await i.reply({
      content: `${res.length} experiment${res.length === 1 ? " is" : "s are"} active in this guild.`,
      files: [new MessageAttachment(Buffer.from(
        `--- Active experiments for ${i.guild!.name} (${i.guildId}) ---

        ${res.map(v => `${v.id}: ${v.treatment.map(treatment).join(", ")}`).join("\n")}
        `.replace(/(\n+)\s+/g, "$1")
      ), "rollouts-" + i.guildId + ".txt")]
    })
  } else {
    const exp = rollouts.get(id);

    if (!exp) {
      i.reply("No experiment with that ID exists.");
      return;
    }

    const val = check(i.guild!, exp);

    if (val.active) {
      i.reply(
      `
        Experiment \`${id}\` is active in this guild. 

        ${val.overrides.length > 0 ? `
          Overrides: ${val.overrides.map(treatment).join(", ")} 
        ` : ""}
        ${val.populations.length > 0 ? `
          Matched populations:
            - ${val.populations.map(p => {
                const t = treatment(p.bucket);

                return `${p.name || "Global"} (${orList.format(p.cond.map(({ s, e }) => `${s}..${e}`))}): ${t}`;
              }).join("\n - ")}
        ` : ""}
      `.replace(/(\n+)\s+/g, "$1")
      );
    } else {
      i.reply(`Experiment \`${id}\` is not active in this guild.`);
    }
  }
}
