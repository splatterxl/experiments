// grma advaith

import {
	ExperimentRollout as DbExperiment,
	ExperimentRollout,
	Filters,
} from '@/lib/db/models';
import { parseNewFilters } from '@/lib/experiments/render';
import { Snowflake } from 'discord-api-types/globals';
import { APIGuild } from 'discord-api-types/v10';
import murmurhash from 'murmurhash';

export interface Experiment {
	data: {
		id: string;
		type: 'guild';
		title: string;
		description: string[];
		buckets: number[];
		hash: number;
	};
	rollout: [
		number, // hash
		string | null, // hash key
		number, // revision
		Population[], // populations
		{
			// overrides
			/** bucket */ b: number;
			/** server IDs */ k: string[];
		}[],
		[Population[]], // overrides formatted
		string | null, // holdout name
		number | null, // holdout bucket
		number // aa mode
	];
}

export type Population = [
	[
		number, //bucket
		{
			// rollout
			/** start */ s: number;
			/** end */ e: number;
		}[]
	][],
	Filter[]
];

export enum FilterType {
	Feature = 1604612045,
	IDRange = 2404720969,
	MemberCount = 2918402255,
	ID = 3013771838,
	HubType = 4148745523,
	VanityURL = 188952590,
	RangeByHash = 2294888943,
}

type FeatureFilter = [FilterType.Feature, [[number, string[]]]];
type IDRangeFilter = [
	FilterType.IDRange,
	[[number, number | null], [number, number]]
];
type MemberCountFilter = [
	FilterType.MemberCount,
	[[number, number | null], [number, number]]
];
type IDFilter = [FilterType.ID, [[number, string[]]]];
type HubTypeFilter = [FilterType.HubType, [[number, number[]]]];
type VanityURLFilter = [
	FilterType.VanityURL,
	[[FilterType.VanityURL, boolean]]
];
type RangeByHashFilter = [
	FilterType.RangeByHash,
	[[number, number], [number, number]]
];

export type Filter =
	| FeatureFilter
	| IDRangeFilter
	| MemberCountFilter
	| IDFilter
	| HubTypeFilter
	| VanityURLFilter
	| RangeByHashFilter;

export const populations = (exp: Experiment) => exp.rollout[3];
export const overrides = (exp: Experiment) => exp.rollout[4];

export const check = (
	guildId: Snowflake,
	exp: ExperimentRollout,
	guild?: APIGuild
) => {
	const hash = murmurhash.v3(`${exp.name ?? exp.hash_key}:${guildId}`) % 1e4;

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

	for (const { b, k } of exp.overrides) {
		if (k.includes(guildId)) {
			res.overrides.push(b);
			res.active = true;
		}
	}

	for (const [
		index,
		{ rollout: rollouts, filters: filters },
	] of exp.populations.entries()) {
		if (
			Object.keys(filters).length === 0 ||
			!guild ||
			checkFilter(filters, guild)
		) {
			for (const { bucket, rollout: rollout } of rollouts) {
				if (bucket === -1 || bucket === 0) continue;
				if (
					rollout.some(
						({ s: start, e: end }) => hash >= start && hash <= end
					) &&
					!res.populations.some((v) => v.bucket === bucket)
				) {
					res.populations.push({
						bucket: bucket,
						index: index,
						name: parseNewFilters(filters),
						cond: rollout,
					});
					res.active = true;
				}
			}
		}
	}

	console.log('checking', `${exp.name ?? exp.hash_key}:${guildId}`, hash, res);

	return res;
};

export const checkFilter = (filter: Filters, guild: APIGuild): boolean => {
	if (
		filter.features &&
		!filter.features.some((f) => guild.features.includes(f as any))
	)
		return false;
	if (
		filter.id_range &&
		((filter.id_range.start && filter.id_range.start > BigInt(guild.id)) ||
			filter.id_range.end < BigInt(guild.id))
	)
		return false;
	if (
		filter.ids &&
		!filter.ids.includes(guild.id) &&
		(guild.owner_id ? !filter.ids.includes(guild.owner_id) : true)
	)
		return false;
	if (filter.range_by_hash) {
		const { hash_key, target } = filter.range_by_hash;

		var hashedKey = murmurhash(`${hash_key}:${guild.id}`);
		if (
			(hashedKey > 0 ? hashedKey + hashedKey : hashedKey >>> 0) % 10000 >=
			target
		)
			return false;
	}

	return true;
};

export const checkMulti = (
	exps: ExperimentRollout[],
	guildId: Snowflake,
	guild: APIGuild
) => {
	return exps
		.map<[ExperimentRollout, ReturnType<typeof check>]>((experiment) => [
			experiment,
			check(guildId, experiment, guild),
		])
		.filter(([, v]) => v.active)
		.map(([exp, matchedData]) => ({
			active: true,
			treatment: [
				...new Set(
					matchedData.overrides.concat(
						matchedData.populations.map((v) => v.bucket)
					)
				),
			],
			id: exp.name,
			exp,
		}));
};

interface Rollout {
	filters: Filters;
	ranges: {
		s: number;
		e: number;
	}[][];
	percentages: number[];
}

export const getExperimentRollout = (
	exp: DbExperiment
): { unfiltered: Rollout[]; filtered: Rollout[] } => {
	const pops = (exp.populations ?? [])
		.concat(exp.overrides_formatted?.flat() ?? [])
		.map((pop) => {
			if (pop.filters.range_by_hash?.target === 1000) {
				// @ts-ignore it is optional
				delete pop.filters.range_by_hash;
			}

			return pop;
		});

	if (!pops.length)
		pops.push({
			filters: {} as any,
			rollout: [
				{
					bucket: -1,
					rollout: [
						{
							s: 0,
							e: 10000,
						},
					],
				},
			],
		});

	let rollout = pops.flatMap((pop) => {
		const rollout = pop.rollout.map((v) => ({
			bucket: v.bucket,
			ranges: v.rollout,
			pc: v.rollout.flatMap((r) => ((r.e - r.s) / 10000) * 100),
		}));

		console.log(
			'original pop',
			pop,
			'rollout',
			rollout,
			'rollout.filter',
			rollout.filter((v) => v.bucket !== -1)
		);

		// 100 - minus all of the rollouts pc
		const control =
			100 -
			rollout
				.filter((v) => v.bucket !== -1)
				.reduce((a, b) => a + b.pc.reduce((a, b) => a + b, 0), 0);

		const final = [
			{
				bucket: -1,
				ranges: rollout.filter((v) => v.bucket === -1).flatMap((v) => v.ranges),
				pc: control,
			},
			...rollout
				.filter((v) => v.bucket !== -1 && getBucket(exp, v.bucket))
				.map((v) => ({
					bucket: v.bucket,
					ranges: v.ranges,
					pc: v.pc.reduce((a, b) => a + b, 0),
				})),
		];

		console.log('final', final);

		// add to final the buckets that are not there

		for (const bucket of exp.buckets.map((_, i) => _)) {
			if (
				!final.find(
					(v) => v.bucket === parseInt(bucket.name.match(/\d+$/g)?.[0] ?? '-1')
				)
			) {
				console.log('inserting bucket', bucket);

				final.push({
					bucket: parseInt(bucket.name.match(/\d+$/g)?.[0] ?? '-1'),
					ranges: [],
					pc: 0,
				});
			}
		}

		return {
			buckets: final.sort((a, b) => a.bucket - b.bucket).map((v) => v.bucket),
			filters: pop.filters,
			ranges: final.sort((a, b) => a.bucket - b.bucket).map((v) => v.ranges),
			percentages: final.sort((a, b) => a.bucket - b.bucket).map((v) => v.pc),
		};
	});

	// put the rollout bucket with no items in item.filters at the start
	let noFilters = rollout.filter((v) => !Object.keys(v.filters).length) ?? [];

	rollout = rollout.filter((v) => !noFilters || Object.keys(v.filters).length);

	if (rollout.length && noFilters?.every((f) => f.percentages[0] === 100)) {
		noFilters = [];
	}

	console.log('rollout', rollout);

	return { unfiltered: noFilters, filtered: rollout?.filter((v) => v) ?? [] };
};

export const getBucket = (exp: DbExperiment, key: number) => {
	const b = (
		[0, -1].includes(key)
			? exp.buckets[0]
			: exp.buckets.find(
					(bucket) => key === parseInt(bucket.name.match(/\d+$/)?.[0] ?? '-1')
			  ) ?? null
	)!;

	if (!b) {
		console.log(
			new Error(`Cannot index experiment ${exp.name ?? exp.id} for key ${key}`)
		);

		return {
			name: b === 0 ? 'Control' : `Treatment ${key}`,
			description: '',
		};
	}

	return b;
};
