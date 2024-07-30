// thanks advaith

import { Snowflake, SnowflakeUtil } from "discord.js";
import { CheckableGuild, dedupe, murmur3 } from "./util.js";

//#region INTERFACES
// https://github.com/aamiaa/NellyTools/blob/main/src/interface/models/experiment.ts

export enum ExperimentType {
  USER = "user",
  GUILD = "guild",
}

export enum ExperimentSource {
  DESKTOP = "desktop",
  ANDROID = "android",
  IOS = "ios",
}

// All fields which are obtained from rollout data must be optional
// since experiments can exist without rollouts
export interface Experiment {
  data_hash?: string;
  build_hash?: string;

  /**
   * MurmurHash3 of the {@link Experiment.hash_key `hash_key`}
   */
  hash: number;
  /**
   * Hash key for the experiment.
   *
   * Use filter to hash the guild ID to determine the bucket, if set,
   * otherwise use the {@link Experiment.hash `exp_id`} field.
   *
   * @example "2021-06_guild_role_subscriptions"
   */
  hash_key?: string;
  /**
   * Internal ID of the experiment
   * @example "2021-06_guild_role_subscriptions"
   */
  exp_id: string;
  /**
   * Type of the experiment
   * @example "guild"
   */
  type: ExperimentType.GUILD;
  /**
   * Human readable title of the experiment
   * @example "Guild Role Subscriptions"
   */
  title?: string;
  /**
   * Treatments of the experiment
   * @example [{ bucket_idx: 0, description: "Control" }]
   */
  treatments?: IExperimentTreatment[];
  /**
   * Rollout populations for guild experiments
   */
  populations?: IExperimentPopulation[];

  overrides?: IBucketOverride[];
  overrides_formatted?: IExperimentPopulation[][];

  revision?: number;
  holdout_name?: string;
  holdout_bucket?: number;
  aa_mode?: boolean;

  // misc nellytools metadata
  in_client?: boolean;
  first_seen?: Date; // If first_seen is NOT set, it means the experiment was backported (i.e. not actually added at that date)
  source: ExperimentSource;
}

export interface IExperimentTreatment {
  bucket_idx: number;
  description: string;

  not_in_client?: boolean;
}

export interface IExperimentPopulation {
  population_idx: number;

  filters: IPopulationFilter[];
  buckets: IPopulationBucket[];

  has_build_restriction?: boolean;
  has_unknown_filter?: boolean;
  platforms?: ExperimentSource[];
}

export interface IRawPopulation {
  population_idx: number;

  buckets: IRawBucket[];

  sources: ExperimentSource[];
  inaccurate_count: number;
}

export interface IRawBucket {
  bucket_idx: number;
  raw_positions: number[];
}

export interface IBucketOverride {
  bucket_idx: number;
  ids: string[];
}

export interface IPopulationFilter {
  type: FilterType;
  guild_ids?: string[];
  min?: string | number;
  max?: string | number;
  guild_features?: string[];
  hub_types?: number[];
  vanity_required?: boolean;
  hash_key?: number;
  target?: number;
}

export interface IPopulationBucket {
  bucket_idx: number;
  positions: {
    start: number;
    end: number;
  }[];
}

export enum FilterType {
  GUILD_IDS = "guild_ids",
  GUILD_ID_RANGE = "guild_id_range",
  GUILD_AGE_RANGE_DAYS = "guild_age_range_days",
  GUILD_MEMBER_COUNT_RANGE = "guild_member_count_range",
  GUILD_HAS_FEATURE = "guild_has_feature",
  GUILD_HUB_TYPES = "guild_hub_types",
  GUILD_HAS_VANITY_URL = "guild_has_vanity_url",
  GUILD_IN_RANGE_BY_HASH = "guild_in_range_by_hash",
}

export enum FilterOption {
  MIN_ID = "min_id",
  MAX_ID = "max_id",
  HASH_KEY = "hash_key",
  TARGET = "target",
}

//#endregion

export * from "./render.js";

export const populations = (exp: Experiment) => exp.populations;
export const overrides = (exp: Experiment) => exp.overrides;

type InclusionReason =
  | "override"
  | "formatted_override"
  | "population"
  | "holdout";

interface CheckResult {
  /**
   * Whether the guild is included in the rollout
   */
  active: boolean;
  included: boolean;
  hash?: number;

  buckets?: number[];

  overrides?: IBucketOverride[];

  holdout?: [name: string, bucket: number];

  populations?: (IExperimentPopulation & {
    maybe: boolean;
  })[];
  formatted_overrides?: (IExperimentPopulation & {
    maybe: boolean;
  })[];
}

export const check = (
  guildId: Snowflake,
  exp: Experiment,
  guild?: CheckableGuild
): CheckResult => {
  if (!exp.hash_key && !exp.exp_id) {
    throw new Error(
      "Experiment has no hash key or exp ID -- incomplete data from Discord"
    );
  }

  const hash = murmur3(exp.hash_key ?? exp.exp_id!, guildId) % 10e3;

  const res: CheckResult & Required<Pick<CheckResult, "buckets" | "active">> = {
    active: false,
    included: true,
    hash,
    buckets: [],
  };

  if (exp.overrides) {
    res.overrides = [];

    for (const override of exp.overrides ?? []) {
      if (override.ids.includes(guildId)) {
        res.active = true;

        res.overrides.push(override);
        res.buckets.push(override.bucket_idx);

        return res;
      }
    }
  }

  if (exp.holdout_name && exp.holdout_bucket) {
    res.holdout = [exp.holdout_name, exp.holdout_bucket];

    const holdout = rollouts.get(exp.holdout_name);

    if (!holdout) throw new ReferenceError("Holdout experiment not found");

    const holdoutRes = check(guildId, holdout, guild);

    if (!holdoutRes.active) {
      return res;
    }

    if (!holdoutRes.buckets?.includes(exp.holdout_bucket)) {
      return res;
    }
  }

  if (exp.overrides_formatted) {
    res.formatted_overrides = [];

    for (const override of exp.overrides_formatted.flat()) {
      const filters = override.filters;

      const filtersRes = checkFilters(filters, guild, guildId);

      if (filtersRes === false) {
        continue;
      }

      const buckets: IPopulationBucket[] = [];

      for (const bucket of override.buckets) {
        const position = bucket.positions.find(
          (pos) => pos.start <= hash && pos.end >= hash
        );

        if (position) {
          buckets.push({ ...bucket, positions: [position] });

          break;
        }
      }

      if (buckets.length === 0) {
        continue;
      }

      res.active = true;
      res.buckets = res.buckets.concat(buckets.map((b) => b.bucket_idx));

      res.formatted_overrides.push({
        ...override,
        buckets,
        maybe: filtersRes === "maybe",
      });
    }
  }

  if (exp.populations) {
    res.populations = [];

    for (const population of exp.populations) {
      const filters = population.filters;

      const filtersRes = checkFilters(filters, guild, guildId);

      if (filtersRes === false) {
        continue;
      }

      const buckets = [];

      for (const bucket of population.buckets) {
        const position = bucket.positions.find(
          (pos) => pos.start <= hash && pos.end >= hash
        );

        if (position) {
          buckets.push({ ...bucket, positions: [position] });

          break;
        }
      }

      if (buckets.length === 0) {
        continue;
      }

      res.active = true;
      res.buckets = res.buckets.concat(buckets.map((b) => b.bucket_idx));

      res.populations.push({
        ...population,
        buckets,
        maybe: filtersRes === "maybe",
      });
    }

    res.populations = res.populations.sort(
      (a, b) => a.population_idx - b.population_idx
    );
  }

  res.buckets = dedupe(res.buckets);

  if (res.buckets.length === 1 && res.buckets[0] === -1) {
    res.active = true;
    res.included = false;
  }

  if (res.active && res.buckets.length === 0) {
    throw new Error("active but without buckets");
  }

  return res;
};

// https://github.com/aamiaa/NellyTools/blob/main/src/models/experiment/methods.ts#L448
export const checkFilters = (
  filters: IPopulationFilter[],
  guild: CheckableGuild | undefined,
  guildId: string
): boolean | "maybe" => {
  if (filters.length === 0) return true;

  for (const filter of filters) {
    const res = checkFilter(filter, guild, guildId);

    if (res !== true) return res;
  }

  return true;
};

const checkFilter = (
  filter: IPopulationFilter,
  guild: CheckableGuild | undefined,
  guildId: string
): boolean | "maybe" => {
  switch (filter.type) {
    case FilterType.GUILD_IDS:
      return filter.guild_ids!.includes(guildId);
    case FilterType.GUILD_ID_RANGE:
      switch (true) {
        case filter.min === undefined:
          return BigInt(guildId) < BigInt(filter.max!);
        case filter.max === undefined:
          return BigInt(guildId) > BigInt(filter.min!);
        default:
          return (
            BigInt(guildId) < BigInt(filter.min!) &&
            BigInt(guildId) > BigInt(filter.max!)
          );
      }
    case FilterType.GUILD_AGE_RANGE_DAYS:
      const snowflake = SnowflakeUtil.deconstruct(guildId);

      const age_ms = Date.now() - Number(snowflake.timestamp);
      const age_days = age_ms / 86400000;

      switch (true) {
        case filter.min === undefined:
          return age_days < +filter.max!;
        case filter.max === undefined:
          return age_days > +filter.min!;
        default:
          return age_days > +filter.min! && age_days < +filter.max!;
      }
    case FilterType.GUILD_MEMBER_COUNT_RANGE:
      const memberCount = guild?.memberCount;

      if (!memberCount) return "maybe";

      switch (true) {
        case filter.min === undefined:
          return memberCount < +filter.max!;
        case filter.max === undefined:
          return memberCount > +filter.min!;
        default:
          return memberCount > +filter.min! && memberCount < +filter.max!;
      }
    case FilterType.GUILD_HAS_FEATURE:
      const features = guild?.features;

      if (!features) return "maybe";

      return filter.guild_features!.some((f) => features.includes(f));

    case FilterType.GUILD_HUB_TYPES:
      const hubType = guild?.hubType;

      if (!hubType) return "maybe";

      return filter.hub_types!.includes(hubType);
    case FilterType.GUILD_HAS_VANITY_URL:
      const vanityURL = guild?.vanityURLCode;

      return filter.vanity_required === !!vanityURL;
    case FilterType.GUILD_IN_RANGE_BY_HASH:
      const hash = murmur3(filter.hash_key!.toString(), guildId);

      return (hash > 0 ? hash + hash : hash >>> 0) % 10e3 < filter.target!;
  }
};

type MultiCheckResult = {
  exp: Experiment;
  buckets: number[];
  confident: boolean;
}[];

/**
 * Given a list of experiments, returns a list of buckets for the experiments the guild is included (diff. from active) in
 */
export const checkMulti = (
  exps: Experiment[],
  guildId: Snowflake,
  guild?: CheckableGuild | null
): MultiCheckResult => {
  const res: MultiCheckResult = [];

  for (const exp of exps) {
    const result = check(guildId, exp, guild ?? undefined);

    result.buckets = result.buckets?.filter((b) => b !== -1);

    if (!result.active || !result.included) {
      res.push({
        exp,
        buckets: [],
        confident: true,
      });

      continue;
    }

    if (result.overrides?.[0]?.bucket_idx) {
      res.push({
        exp,
        buckets: [result.overrides[0].bucket_idx],
        confident: true,
      });

      continue;
    }

    if (result.formatted_overrides?.length) {
      if (result.formatted_overrides.length === 1)
        res.push({
          exp,
          buckets: [result.formatted_overrides[0].buckets[0].bucket_idx],
          confident: !result.formatted_overrides[0].maybe,
        });
      else if (result.formatted_overrides.every((o) => !o.maybe)) {
        res.push({
          exp,
          buckets: [result.formatted_overrides[0].buckets[0].bucket_idx],
          confident: true,
        });
      } else {
        res.push({
          exp,
          buckets: result.formatted_overrides.map(
            (o) => o.buckets[0].bucket_idx
          ),
          confident: false,
        });
      }

      continue;
    }

    if (result.populations?.length) {
      if (result.populations.length === 1)
        res.push({
          exp,
          buckets: [result.populations[0].buckets[0].bucket_idx],
          confident: !result.populations[0].maybe,
        });
      else if (result.populations.every((o) => !o.maybe)) {
        res.push({
          exp,
          buckets: [result.populations[0].buckets[0].bucket_idx],
          confident: true,
        });
      } else {
        res.push({
          exp,
          buckets: result.populations.map((o) => o.buckets[0].bucket_idx),
          confident: false,
        });
      }

      continue;
    }
  }

  return res
    .map((r) => ({ ...r, buckets: r.buckets.filter((b) => b !== -1) }))
    .filter((r) => r.buckets.length);
};

export function treatmentName(
  t: number | string,
  exp?: Experiment,
  removePrefix?: boolean
): string;
export function treatmentName(
  elem: number,
  _index?: number,
  _array?: number[]
): string;
export function treatmentName(
  t: number | string,
  exp?: Experiment | number,
  removePrefix: boolean | number[] = false
) {
  switch (typeof t) {
    case "number":
      if (t === -1) return "Not Included";
      if (t === 0) return "Control";

      if (!exp || typeof exp === "number") {
        return `Treatment ${t}`;
      } else {
        const desc = exp.treatments?.find(
          (s) => s.bucket_idx === t
        )?.description;

        return desc
          ? removePrefix
            ? desc.split(":").slice(1).join(":")
            : desc
          : `Treatment ${t}`;
      }
    case "string":
      return t.split(":")[0];
    default:
      throw new TypeError("Invalid treatment name");
  }
}

import { rollouts } from "./load.js";
