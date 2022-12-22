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
		[Population[]] // overrides formatted
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
	VanityURL = 188952590, // format unknown
	RangeByHash = 2294888943
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
type RangeByHashFilter = [
	FilterType.RangeByHash,
	[[_: number, hash_key: number], [_: number, target: number]]
];

export type Filter =
	| FeatureFilter
	| IDRangeFilter
	| MemberCountFilter
	| IDFilter
	| HubTypeFilter
	| RangeByHashFilter;
