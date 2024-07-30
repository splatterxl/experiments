import { APIEmbed } from "discord-api-types/v10";
import {
  ActionRow,
  ActionRowBuilder,
  APISelectMenuOption,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  GuildHubType,
  InteractionReplyOptions,
  MessageActionRowComponent,
  SelectMenuBuilder,
  SelectMenuOptionBuilder,
  Snowflake,
  SnowflakeUtil,
  User,
} from "discord.js";
import { dirname, join } from "path";
import {
  checkMulti,
  Experiment,
  FilterType,
  IBucketOverride,
  IExperimentPopulation,
  IPopulationBucket,
  IPopulationFilter,
  treatmentName,
} from "./experiment.js";
import { lastFetchedAt, rollouts } from "./index.js";
import { __DEV__, murmur3 } from "./util.js";

import dayjs from "dayjs";
import duration from "dayjs/plugin/duration.js";
import relativeTime from "dayjs/plugin/relativeTime.js";
import { readFile } from "fs/promises";
dayjs.extend(duration);
dayjs.extend(relativeTime);

export const andList = new Intl.ListFormat();
export const orList = new Intl.ListFormat(undefined, { type: "disjunction" });

const __dirname = dirname(import.meta.url).replace(/^file:\/\//, "");

const guilds = await readFile(
  join(__dirname, "..", "guilds.json"),
  "utf8"
).then((res) => JSON.parse(res));

export const parseFilter = (filter: IPopulationFilter) => {
  switch (filter.type) {
    case FilterType.GUILD_IDS:
      return `Guild ID is one of: ${orList.format(filter.guild_ids!)}`;
    case FilterType.GUILD_ID_RANGE:
      if (filter.min && filter.max)
        return `Guild was created between ${new Date(
          Number(SnowflakeUtil.deconstruct(BigInt(filter.min!)).timestamp)
        ).toISOString()} and ${new Date(
          Number(SnowflakeUtil.deconstruct(BigInt(filter.max!)).timestamp)
        ).toISOString()} `;
      else if (!filter.max && filter.min)
        return `Guild was created after ${new Date(
          Number(SnowflakeUtil.deconstruct(BigInt(filter.min!)).timestamp)
        ).toISOString()}`;
      else if (!filter.min && filter.max)
        return `Guild was created before ${new Date(
          Number(SnowflakeUtil.deconstruct(BigInt(filter.max!)).timestamp)
        ).toISOString()}`;
      else throw new Error("invalid guild_id_range filter");
    case FilterType.GUILD_AGE_RANGE_DAYS:
      if (filter.min && filter.max)
        return `Guild is between ${dayjs
          .duration(+filter.min!, "days")
          .humanize()} and ${dayjs
          .duration(+filter.max!, "days")
          .humanize()} old`;
      else if (!filter.max && filter.min)
        return `Guild is at least ${dayjs
          .duration(+filter.min!, "days")
          .humanize()} old`;
      else if (!filter.min && filter.max)
        return `Guild is less than ${dayjs
          .duration(+filter.max!, "days")
          .humanize()} old`;
      else throw new Error("invalid guild_age_range_days filter");
    case FilterType.GUILD_MEMBER_COUNT_RANGE:
      if (filter.min && filter.max)
        return `Guild has between ${filter.min} and ${filter.max} members`;
      else if (!filter.max && filter.min)
        return `Guild has at least ${filter.min} members`;
      else if (!filter.min && filter.max)
        return `Guild has less than ${filter.max} members`;
      else throw new Error("invalid guild_age_range_days filter");
    case FilterType.GUILD_HAS_FEATURE:
      return `Guild has feature ${orList.format(filter.guild_features!)}`;
    case FilterType.GUILD_HUB_TYPES:
      return `Guild hub type is one of: ${orList.format(
        filter.hub_types!.map((hubType) => GuildHubType[hubType])
      )}`;
    case FilterType.GUILD_HAS_VANITY_URL:
      return `Guild ${
        filter.vanity_required ? "has" : "does not have"
      } a vanity URL code`;
    case FilterType.GUILD_IN_RANGE_BY_HASH:
      return `Guild in range 0..${filter.target} by hash ${filter.hash_key}`;
  }
};

export const parsePopulations = (
  p: IExperimentPopulation[],
  exp: Experiment
) => {
  return p.map((p) => parsePopulation(p, exp));
};

export const parsePopulation = (p: IExperimentPopulation, exp: Experiment) => {
  const b = parseBuckets(p.buckets, exp);
  const f = p.filters.map(parseFilter).join("\n");

  if (!f.length) return `Default\n${b}`;

  return `${f}\n${b}`;
};

export const parseBuckets = (p: IPopulationBucket[], exp: Experiment) => {
  return p
    .map(
      (p) =>
        `${treatmentName(p.bucket_idx)}: ${p.positions
          .map((v) => `${v.start}..${v.end}`)
          .join(", ")}`
    )
    .map((v) => ` => ${v}`)
    .join("\n")
    .trim();
};

export const parseOverrides = (o: IBucketOverride[], exp: Experiment) => {
  return o.map(
    (o) =>
      `${treatmentName(o.bucket_idx)}\n------------\n${o.ids
        .map((id) => `${id}${id in guilds ? `: ${guilds[id]}` : ""}`)
        .join("\n")}`
  );
};

/**
 * @deprecated
 */
export const rolloutPercentage = (r: any) => {
  return 0;
};

export const createDefaultEmbed = (exp: Experiment): APIEmbed => {
  return {
    title: `${exp.title} (${exp.exp_id})`,
    color: 0xffcc00,
    footer: {
      text: `${exp.exp_id} - ${exp.treatments?.length ?? "unknown"} buckets`,
    },
  };
};

export function renderExperimentHomeView(
  i: { guild: any; guildId: any },
  id: string
): InteractionReplyOptions {
  const exp = rollouts.get(id)!;

  return {
    content: `Last updated: <t:${Math.floor(lastFetchedAt / 1000)}>${
      !exp.in_client ? ". This experiment is no longer in the client!" : ""
    }`,
    embeds: [
      {
        ...createDefaultEmbed(exp),
        url: createRolloutsURL(exp.hash, false),
        description: `${
          i.guildId
            ? `\nGuild position: ${murmur3(exp.exp_id, i.guildId) % 1e4}`
            : ""
        }`,
        fields: [
          {
            name: "Treatments",
            value:
              exp.treatments
                ?.map(
                  (t) =>
                    `${t.description}${
                      t.not_in_client ? " (not in client)" : ""
                    }`
                )
                .join("\n") ?? "Unknown",
          },
        ],
      },
    ],
    components: renderPageComponents(i, exp, "home"),
    files: [],
  };
}

export function renderRolloutView(
  i: { guild: any; user: User },
  id: string
): InteractionReplyOptions {
  const exp = rollouts.get(id)!;

  return {
    content: `${
      !exp.populations?.length && !exp.overrides_formatted?.length
        ? "The rollout for this experiment has not started yet. "
        : ""
    }Last updated: <t:${Math.floor(lastFetchedAt / 1000)}>`,
    files:
      exp.populations?.length || exp.overrides_formatted?.length
        ? [
            new AttachmentBuilder(
              Buffer.from(
                `# Rollout for ${exp.title} (${exp.exp_id})\n${"=".repeat(
                  10
                )}\n${
                  !exp.in_client
                    ? "\n*** This experiment is no longer in the client! ***\n"
                    : ""
                }\n${
                  exp.overrides_formatted?.length
                    ? `Formatted Overrides:\n${"-".repeat(
                        50
                      )}\n${parsePopulations(
                        exp.overrides_formatted?.flat(),
                        exp
                      ).join("\n\n")}`
                    : ""
                }${
                  exp.overrides_formatted?.length && exp.populations?.length
                    ? `\n\n\n`
                    : ""
                }${
                  exp.populations?.length
                    ? `Populations:\n${"-".repeat(50)}\n${parsePopulations(
                        exp.populations,
                        exp
                      ).join("\n\n")}`
                    : ""
                }`
              ),
              {
                name: `${exp.exp_id}-rollout.txt`,
              }
            ),
          ]
        : [],
    embeds: [],
    components: renderPageComponents(i, exp, "rollout"),
  };
}

export function renderOverrideView(
  i: { guild: any; user: User },
  id: string
): InteractionReplyOptions {
  const exp = rollouts.get(id)!;

  return {
    content: `${
      !exp.overrides?.length
        ? "There are no overrides for this experiment. "
        : ""
    }Last updated: <t:${Math.floor(lastFetchedAt / 1000)}>`,
    embeds: [],
    files: exp.overrides?.length
      ? [
          new AttachmentBuilder(
            Buffer.from(
              `--- Overrides for ${exp.title} (${
                exp.exp_id
              }) ---\n\n${parseOverrides(exp.overrides, exp).join("\n\n")}`
            ),
            {
              name: `${exp.exp_id}-overrides.txt`,
            }
          ),
        ]
      : [],
    components: renderPageComponents(i, exp, "overrides"),
  };
}

export function renderPageComponents(
  i: { guild: any },
  exp: Experiment,
  currentPage: string = "home"
): ActionRow<MessageActionRowComponent>[] {
  // we can't edit while not in the guild without the interaction token,
  // so we check for the guild
  return i.guild
    ? ([
        new ActionRowBuilder()
          .addComponents(
            new SelectMenuBuilder()
              .setCustomId(`view,page`)
              .addOptions(
                ...([
                  new SelectMenuOptionBuilder()
                    .setLabel("Home")
                    .setValue(`home,${exp.exp_id}`)
                    .setDescription("View this experiment's details.")
                    .setDefault(currentPage === "home")
                    .toJSON(),
                  (exp.populations?.length ||
                    exp.overrides_formatted?.length) &&
                    new SelectMenuOptionBuilder()
                      .setLabel("Rollout")
                      .setValue(`rollout,${exp.exp_id}`)
                      .setDescription("View the rollout of this experiment.")
                      .setDefault(currentPage === "rollout")
                      .toJSON(),
                  exp.overrides?.length &&
                    new SelectMenuOptionBuilder()
                      .setLabel("Overrides")
                      .setValue(`overrides,${exp.exp_id}`)
                      .setDescription(
                        "View rollout overrides of this experiment."
                      )
                      .setDefault(currentPage === "overrides")
                      .toJSON(),
                  __DEV__ &&
                    new SelectMenuOptionBuilder()
                      .setLabel("JSON")
                      .setValue(`json,${exp.exp_id}`)
                      .setDescription("View raw data (dev only)")
                      .setDefault(currentPage === "json")
                      .toJSON(),
                ].filter((v) => v) as APISelectMenuOption[])
              )
              .setPlaceholder("Select a page...")
          )
          .toJSON(),
        createDisclaimerComponent(),
      ] as unknown as any)
    : [];
}

export function createDisclaimerComponent() {
  return new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Danger)
        .setCustomId("info,disclaimer")
        .setLabel("Disclaimer")
    )
    .toJSON();
}

export const enum ViewType {
  Content,
  Attachment,
}

export function generateMultiExperimentRolloutCheck(
  i: CommandInteraction,
  guildId: Snowflake,
  res: ReturnType<typeof checkMulti>
): [type: ViewType, data: string] {
  return [ViewType.Attachment, JSON.stringify(res, null, 2)];
}

export function createRolloutsURL(id: number, blocked = true) {
  return `${blocked ? "<" : ""}https://nelly.tools/experiments/${id}${
    blocked ? ">" : ""
  }`;
}
