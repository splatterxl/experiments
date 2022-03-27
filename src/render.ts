import { Experiment, Filter, FilterType } from "./experiment.js";
import { ActionRow, ActionRowBuilder, Interaction, InteractionReplyOptions, MessageActionRowComponent, MessageAttachment, SelectMenuBuilder, SelectMenuOptionBuilder } from "discord.js";
import { lastFetchedAt, rollouts } from "./index.js";
import { APIEmbed } from "discord-api-types/v10";

export const andList = new Intl.ListFormat();
export const orList = new Intl.ListFormat({ type: "disjunction" });


export const parseFilter = (f: Filter) => {
	if (f[0] === FilterType.Feature) return `Server has feature ${orList.format(f[1][0][1])}`;
	if (f[0] === FilterType.IDRange) return `Server ID is in range ${f[1][0][1] ?? 0} - ${f[1][1][1]}`;
	if (f[0] === FilterType.MemberCount) return `Server member count is ${f[1][1][1] ? `in range ${f[1][0][1] ?? 0} - ${f[1][1][1]}` : `${f[1][0][1]}+`}`;
	if (f[0] === FilterType.ID) return `Server ID is ${orList.format(f[1][0][1])}`;
	if (f[0] === FilterType.HubType) return `Server hub type is ${orList.format(f[1][0][1].map(t => t.toString()))}`;
	return `Unknown filter type ${f[0]}`;
};

export const parseFilterShort = (f: Filter) => {
	if (f[0] === FilterType.Feature) return `has feature ${orList.format(f[1][0][1])}`;
	if (f[0] === FilterType.IDRange) return `ID is in range ${f[1][0][1] ?? 0} - ${f[1][1][1]}`;
	if (f[0] === FilterType.MemberCount) return `member count is ${f[1][1][1] ? `in range ${f[1][0][1] ?? 0} - ${f[1][1][1]}` : `${f[1][0][1]}+`}`;
	if (f[0] === FilterType.ID) return `ID is one of \`...\``;
	if (f[0] === FilterType.HubType) return `hub type is ${orList.format(f[1][0][1].map(t => t.toString()))}`;
	return `unknown`;
}

export const parsePopulations = (r: Experiment["rollout"][3], exp: Experiment) => {
  return r.map(p => {
    const d = parsePopulation(p[0], exp);
    const f = p[1].map(parseFilter).join("\n");

    if (!f.length) return `Default\n${d}\n`;

    return `${f}\n${d}\n`
  })
}

export const parsePopulation = (p: Experiment["rollout"][3][0][0], exp: Experiment) => {
  return p.map(p => `${treatment(p[0])}: ${p[1].map(v => `${v.s}..${v.e}`).join(", ")}`).map(v => ` => ${v}`).join("\n");
}

export const parseOverrides = (o: Experiment["rollout"][4], exp: Experiment) => {
  return o.map(o => `${treatment(o.b)}\n------------\n${o.k.join("\n")}`)
}

export const treatment = (t: number) => {
  if (t === -1) return "None";
  if (t === 0) return "Control";
  return `Treatment ${t}`;
}

export const rolloutPercentage = (r: Experiment["rollout"][3]) => {
  const rollout = r.filter(p => p[1].length === 0);

  let t = 0;

  for (const r of rollout) {
    const p = r[0];

    for (const [b, v] of p) {
      if (b === -1 || b === 0) continue;

      for (const p of v) {
        t += p.e - p.s;
      }
    }
  }

  return Math.trunc((t / 10_000) * 100);
}

export const createDefaultEmbed = (exp: Experiment): APIEmbed => {
  return {
      title: `${exp.data.title} (${exp.data.id})`,
      color: 0xffcc00,
      footer: {
        text: `${exp.data.id} - ${exp.data.buckets.length} buckets`
      }
  }
}

export function renderExperimentHomeView(i: Interaction, id: string): InteractionReplyOptions {
  const exp = rollouts.get(id)!;

  return {
    content: `Experiment data available may not always be accurate. Last updated: <t:${Math.floor(lastFetchedAt / 1000)}>`,
    embeds: [{ 
      ...createDefaultEmbed(exp),
      description: `Rollout: ${rolloutPercentage(exp.rollout[3])}%`,
      fields: [
        {
          name: "Treatments",
          value: exp.data.description.map(v => v.includes(":") ? v : (v + ": <no description>")).join("\n")
        }
      ]
    }],
    components: renderPageSelect(i, exp),
    attachments: [],
  };
}

export function renderRolloutView(i: Interaction, id: string): InteractionReplyOptions {
  const exp = rollouts.get(id)!;

  return {
    content: `Experiment data available may not always be accurate. Last updated: <t:${Math.floor(lastFetchedAt / 1000)}>`,
    files: [new MessageAttachment(Buffer.from(
      `--- Rollout for ${exp.data.title} (${exp.data.id}) ---

        Percentage complete: ${rolloutPercentage(exp.rollout[3])}%

        Populations: 
        --------------------------------------------------

        ${parsePopulations(exp.rollout[3], exp).join("\n\n")}
      `.replace(/(\n+)\s+/g, "$1")
    ), exp.data.id + "-rollout.txt")],
    embeds: [],
    components: renderPageSelect(i, exp),
  };
}

export function renderOverrideView(i: Interaction, id: string): InteractionReplyOptions {
  const exp = rollouts.get(id)!;

  return {
    content: `Experiment data available may not always be accurate. Last updated: <t:${Math.floor(lastFetchedAt / 1000)}>`,
    embeds: [],
    files: [new MessageAttachment(Buffer.from(
      `--- Overrides for ${exp.data.title} (${exp.data.id}) ---

      ${parseOverrides(exp.rollout[4], exp).join("\n\n")}
      `.replace(/(\n+)\s+/g, "$1"),
    ), exp.data.id + "-overrides.txt")],
    components: renderPageSelect(i, exp),
  };
}

export function renderPageSelect(i: Interaction, exp: Experiment): ActionRow<MessageActionRowComponent>[] {
  return [
      new ActionRowBuilder()
        .addComponents(
          new SelectMenuBuilder()
          .setCustomId(`page,view,${i.user.id}`)
          .addOptions(
            new SelectMenuOptionBuilder()
              .setLabel("Home")
              .setValue(`home,${exp.data.id}`)
              .setDescription("View this experiment's details.")
              .toJSON(),
            new SelectMenuOptionBuilder()
              .setLabel("Rollout")
              .setValue(`rollout,${exp.data.id}`)
              .setDescription("View the rollout of this experiment.")
             .toJSON(),
            new SelectMenuOptionBuilder()
              .setLabel("Overrides")
              .setValue(`overrides,${exp.data.id}`)
              .setDescription("View rollout overrides of this experiment.")
              .toJSON(),
          ) 
        )
        .toJSON(),
  ] as unknown as any
}
