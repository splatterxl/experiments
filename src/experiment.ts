// thanks advaith

import { Guild, GuildFeature } from "discord.js";
import { andList, parseFilterShort } from "./render.js";
import { dedupe, murmur3 } from "./util.js";

export interface Experiment {
  data: {
    id: string;
    type: "guild";
    title: string;
    description: string[];
    buckets: number[];
    hash: number;
  };
  rollout: [
    hash: number, // hash
    _: null,
    revision: number,
    populations: [
      // populations
      [
        number, //bucket
        {
          // rollout
          /** start */ s: number;
          /** end */ e: number;
        }[]
      ][],
      Filter[]
    ][],
    overrides: {
      // overrides
      /** bucket */ b: number;
      /** server IDs */ k: string[];
    }[]
  ];
}

export enum FilterType {
  Feature = 1604612045,
  IDRange = 2404720969,
  MemberCount = 2918402255,
  ID = 3013771838,
  HubType = 4148745523,
}

type FeatureFilter = [FilterType.Feature, [[_: number, features: string[]]]];
type IDRangeFilter = [
  FilterType.IDRange,
  [[_: number, start: number | null], [_: number, end: number]]
];
type MemberCountFilter = [
  FilterType.MemberCount,
  [[_: number, start: number | null], [_: number, end: number]]
];
type IDFilter = [FilterType.ID, [[_: number, ids: string[]]]];
type HubTypeFilter = [FilterType.HubType, [[_: number, types: number[]]]];

export type Filter =
  | FeatureFilter
  | IDRangeFilter
  | MemberCountFilter
  | IDFilter
  | HubTypeFilter;

export * from "./render.js";

export const populations = (exp: Experiment) => exp.rollout[3];
export const overrides = (exp: Experiment) => exp.rollout[4];

export const check = (guild: Guild, exp: Experiment) => {
  const hash = murmur3(`${exp.data.id}:${guild.id}`) % 1e4;

  const res: {
    populations: {
      bucket: number;
      index: number;
      name: string;
      cond: { s: number; e: number }[];
    }[];
    active: boolean;
    overrides: number[];
  } = {
    populations: [],
    active: false,
    overrides: [],
  };

  for (const { b, k } of overrides(exp)) {
    if (k.includes(guild.id)) {
      res.overrides.push(b);
      res.active = true;
    }
  }

  for (const [i, [p, filter]] of populations(exp).entries()) {
    if (filter.length === 0 || filter.every((f) => checkFilter(f, guild))) {
      for (const [b, r] of p) {
        if (b === -1 || b === 0) continue;
        if (r.some(({ s, e }) => hash >= s && hash <= e)) {
          res.populations.push({
            bucket: b,
            index: i,
            name: andList.format(filter.map((f) => parseFilterShort(f))),
            cond: r,
          });
          res.active = true;
        }
      }
    }
  }

  return res;
};

export const checkFilter = (filter: Filter, guild: Guild) => {
  const [t, f] = filter;

  switch (t) {
    case FilterType.Feature:
      const [[, features]] = f;
      return features.some((f) => guild.features.includes(f as GuildFeature));
    case FilterType.IDRange: {
      const [[, start], [, end]] = f;
      return (start === null || +guild.id >= start) && +guild.id <= end;
    }
    case FilterType.MemberCount: {
      const [[, start], [, end]] = f;
      return (
        (start === null || guild.memberCount >= start) &&
        guild.memberCount <= end
      );
    }
    case FilterType.ID:
      const [[, ids]] = f;
      return ids.includes(guild.id);
    case FilterType.HubType:
      break;
  }
};

export const checkMulti = (exps: Experiment[], guild: Guild) =>
  exps
    .map<[Experiment, ReturnType<typeof check>]>((experiment) => [
      experiment,
      check(guild, experiment),
    ])
    .filter(([, v]) => v.active)
    .map(([exp, matchedData]) => ({
      active: true,
      treatment: dedupe(
        matchedData.overrides.concat(
          matchedData.populations.map((v) => v.bucket)
        )
      ),
      id: exp.data.id,
      exp,
    }));
