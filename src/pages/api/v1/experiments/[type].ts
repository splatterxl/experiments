import { ObjectId } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';
import { one } from '../../../../utils';
import { client } from '../../../../utils/database';
import { getBySearch } from './search';

export interface ExperimentAether {
	type: string;
	title: string;
	description: string[] | null;
	buckets: number[] | null;
	id: string;
	hash: number;
}

export interface Experiment {
	type: 'user' | 'guild';
	title: string;
	buckets: { name: string; description: string | null }[];
	id: string;
	hash: number;
}

export interface ExperimentRollout {
	populations: Population[];
	overrides: Override[];
	overrides_formatted: [Population[]];
}

export interface Population {
	rollout: Rollout[];
	filters: Filters;
}

export interface Rollout {
	bucket: number;
	rollout: Rollout[];
}

export interface Filters {
	features: string[] | null;
	id_range: { start: bigint | null; end: bigint } | null;
	member_count: { start: bigint | null; end: bigint | null } | null;
	ids: bigint[] | null;
	hub_types: number[] | null;
	range_by_hash: { hash_key: bigint; target: number } | null;
}

export interface Override {
	b: number;
	k: bigint[];
}

export default async function listExperiments(
	req: NextApiRequest,
	res: NextApiResponse
) {
	try {
		delete req.query.q;

		res.send(await getBySearch(req.query as any));
	} catch (err: any) {
		res.status(400).send({ error: err.message });
	}
}

export interface GetExperimentsOptions {
	type?: 'user' | 'guild' | 'any';
	q?: string;
	limit?: number;
	cursor?: number;
	with_rollouts?: boolean;
}

export async function getExperiments(
	options: GetExperimentsOptions
): Promise<Experiment[]> {
	if (options.limit != undefined && options.limit > 200)
		throw new TypeError('limit must be less than 200');

	const withRollouts = !!options.with_rollouts;

	let json = await client
		.collection<Experiment>('experiments')
		.find(!withRollouts ? { type: { $exists: true } } : {})
		.skip(options.cursor ?? 0)
		.limit(options.limit ?? 50)
		.toArray()
		.then((docs) =>
			docs.map(
				(doc: Experiment & { _id?: ObjectId } & Partial<ExperimentRollout>) => {
					delete doc._id;

					doc.buckets = doc.buckets.map((v) => ({
						...v,
						description:
							v.description?.replace(/^(Control|Treatment \d+)(: )?/, '') ||
							null
					}));

					if (!withRollouts) {
						delete doc.overrides;
						delete doc.overrides_formatted;
						delete doc.populations;
					}

					return doc;
				}
			)
		);

	const query = one(options.type);

	if (query) {
		switch (query) {
			case 'user':
				json = json.filter((v) => v.type === 'user');
				break;
			case 'guild':
				json = json.filter((v) => v.type === 'guild');
				break;
			case 'any':
				break;
			default:
				throw new TypeError(
					'Invalid experiment filter, must be one of [user, guild]'
				);
		}
	}

	return json;
}
