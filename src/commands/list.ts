import {
  AttachmentBuilder,
  ButtonInteraction,
  CommandInteraction,
} from "discord.js";
import { checkMulti, orList, treatmentName } from "../experiment.js";
import { rollouts } from "../load.js";
import { __DEV__, getGuild } from "../util.js";

export default async function (i: CommandInteraction) {
  const id = (i.options.get("id", false)?.value as string) ?? i.guildId;

  if (id == null) {
    await i.reply("You must provide a guild ID.");
    return { success: false, error: "no guild" };
  }

  const guild = await getGuild(id, i.client, i);

  const experiments = rollouts
    .filter(
      (r) =>
        r.overrides?.length ||
        r.populations?.length ||
        r.overrides_formatted?.length
    )
    .toJSON();

  if (experiments.length === 0) {
    await i.reply("Unexpected service interruption. Please try again later.");
    return { success: false, error: "no rollouts" };
  }

  const res = checkMulti(experiments, id, guild).sort((a, b) =>
    b.exp.exp_id.localeCompare(a.exp.exp_id)
  );
  const confident = res.filter((r) => r.confident);
  const maybe = res.filter((r) => !r.confident);

  const content = `# Experiments active in this server\n${confident
    .map(
      (r) =>
        `### **${r.exp.title ?? r.exp.exp_id}**: ${treatmentName(
          r.buckets[0]
        )}\n* ${treatmentName(r.buckets[0], r.exp, true)}`
    )
    .join("\n")}${confident.length && maybe.length ? "\n\n" : ""}${
    maybe.length ? `## Possibly active\n${res.filter((r) => !r.confident)}` : ""
  }`;

  await i.reply({
    content: content.length > 2000 ? "Results are attached." : content,
    files: (content.length > 2000
      ? [
          new AttachmentBuilder(
            Buffer.from(
              `=======================================\n Rollouts for ${
                guild?.name ? `${guild.name} (${guild.id})` : id
              }\n=======================================\n\n${res
                .filter((s) => s.confident)
                .map((s) =>
                  `${s.exp.title ?? ""} (${s.exp.exp_id})\n--> ${treatmentName(
                    s.buckets[0],
                    s.exp
                  )}`.trimStart()
                )
                .join("\n\n")}${
                confident.length && maybe.length ? "\n\n" : ""
              }${
                maybe.length
                  ? `Possibly included (check individually)\n--------------------------\n${maybe
                      .map(
                        (s) =>
                          `- ${s.exp.title ?? ""} (${
                            s.exp.exp_id
                          }): ${orList.format(s.buckets.map(treatmentName))}`
                      )
                      .join("\n")}`
                  : ""
              }`
            ),
            {
              name: `rollouts-guild-${i.guildId}.txt`,
            }
          ),
        ]
      : []
    ).concat(
      __DEV__
        ? [
            new AttachmentBuilder(Buffer.from(JSON.stringify(res, null, 2)), {
              name: "dev.json",
            }),
          ]
        : []
    ),
  });

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
