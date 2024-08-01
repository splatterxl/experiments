import { CommandInteraction } from "discord.js";
import { check, treatmentName } from "../experiment.js";
import { getRollouts } from "../index.js";
import { createRolloutsURL, parsePopulation } from "../render.js";
import { __DEV__, getGuild, removeRolloutsPrefix } from "../util.js";
import list from "./list.js";

export default async function (i: CommandInteraction) {
  const rollouts = getRollouts();

  const id = removeRolloutsPrefix(
    i.options.get("experiment", true).value!.toString()
  ).toLowerCase();

  if (["all", "all experiments"].includes(id.toLowerCase())) {
    return list(i);
  }

  const guildId = (i.options.get("id", false)?.value as string) ?? i.guildId;

  if (!/^\d{17,19}$/.test(guildId)) {
    i.reply("Invalid guild ID.");
    return { error: "invalid gid" };
  }

  if (rollouts.size === 0) {
    i.reply("Unexpected service interruption. Please try again later.");
    return { error: "no rollouts" };
  }

  const guild =
    guildId === i.guildId ? i.guild : await getGuild(guildId, i.client);

  const exp = rollouts.get(id);

  if (!exp) {
    i.reply("No experiment with that ID exists.");
    return { error: "invalid exp" };
  }

  if (
    !exp.overrides?.length &&
    !exp.populations?.length &&
    !exp.overrides_formatted?.length
  ) {
    i.reply("This experiment has no associated rollout data.");

    return { error: "no data" };
  }

  const val = check(guildId, exp, guild ?? undefined);

  let lines = `# ${exp.title ?? exp.exp_id}\n-# ${
    exp.title ? exp.exp_id + " •" : ""
  }${
    exp.hash_key && exp.hash_key !== exp.exp_id ? exp.hash_key + " •" : ""
  } [View on nelly.tools](${createRolloutsURL(exp.hash, true)})${
    !val.active
      ? `\n\nThe experiment is not active on th${
          guildId === i.guildId
            ? "is guild"
            : `e guild \`${guild?.name ?? guildId}\``
        }.`
      : ""
  }\n\n`;

  if (val.active) {
    // resolves the effective bucket(s)
    // formula: override -> formatted override -> populations(maybe=false) -> populations(maybe=true)
    // at any point in this there can be more than 1 bucket returned (this is probably unintentional, but
    // errors by Discord may result in multiple overrides or populations(maybe=false) being effective for
    // a guild)
    // additionally - for populations(maybe=true), due to the bot not being able to determine if a guild
    // meets the requirements, it automatically assumes that it does. in this case many different pops
    // may be returned which have different filters
    let has_effective = false;

    // overrides

    if (val.overrides?.length) {
      lines += `__${treatmentName(
        val.overrides[0].bucket_idx,
        exp
      )}__ (id override)`;

      has_effective = true;
    }

    if (
      !val.formatted_overrides?.some((f) => f.maybe) &&
      !val.populations?.some((p) => p.maybe) &&
      !has_effective
    ) {
      effective: {
        if (
          val.formatted_overrides?.length &&
          !val.formatted_overrides[0].maybe
        ) {
          lines += `__${treatmentName(
            val.formatted_overrides[0].buckets[0].bucket_idx,
            exp
          )}__ (formatted override)\n`;
          lines += `\`\`\`rs\n${parsePopulation(
            val.formatted_overrides[0],
            exp
          )}\n\`\`\``;

          has_effective = true;

          break effective;
        }

        if (val.populations?.length && !val.populations[0].maybe) {
          lines += `__${treatmentName(
            val.populations[0].buckets[0].bucket_idx,
            exp
          )}__ (population)\n`;
          lines += `\`\`\`rs\n${parsePopulation(
            val.populations[0],
            exp
          )}\n\`\`\``;

          has_effective = true;

          break effective;
        }
      }
    } else {
      if (has_effective) lines += "\n";

      // formatted overrides
      const overrides = val.formatted_overrides;

      if (overrides?.length) {
        for (const override of overrides) {
          lines += `__${treatmentName(
            override.buckets[0].bucket_idx,
            exp
          )}__ (formatted override)\n`;
          lines += `\`\`\`rs\n${parsePopulation(override, exp)}\n\`\`\`\n\n`;
        }
      }

      // populations
      const populations = val.populations;

      if (populations?.length) {
        for (const pop of populations) {
          lines += `__${treatmentName(
            pop.buckets[0].bucket_idx,
            exp
          )}__ (population)\n`;
          lines += `\`\`\`rs\n${parsePopulation(pop, exp)}\n\`\`\`\n\n`;
        }
      }

      lines +=
        "Check manually that the guild passes all the filters. Alternatively: add the bot to this guild.\n\n";
    }
  }

  if (lines.length > 2000) {
    i.reply({
      content: "Output too long to send. Attached as a file.",
      files: [
        {
          name: "output.txt",
          attachment: Buffer.from(lines),
        },
        {
          name: "dev.json",
          attachment: Buffer.from(JSON.stringify(val, null, 2)),
        },
      ].filter((s) => __DEV__ || s.name === "dev.json"),
    });
  } else {
    i.reply({
      content: lines,
      files: __DEV__
        ? [
            {
              name: "dev.json",
              attachment: Buffer.from(JSON.stringify(val, null, 2)),
            },
          ]
        : undefined,
    });
  }

  return { success: true };
}
