import { ObjectId } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';
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
	hash_key: number;
}

export interface ExperimentRollout {
	type: 'guild';
	populations: Population[];
	overrides: Override[];
	overrides_formatted: [Population[]];
}

export interface ExperimentAssignment {
	type: 'user';
	has_assignments: boolean;
	assignments?: Record<`${number}`, number>;
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
	type?: 'user' | 'guild';
	q?: string;
	limit?: number;
	cursor?: number;
	with_rollouts?: boolean;
	with_assignments?: boolean;
}

export async function getExperiments(
	options: GetExperimentsOptions
): Promise<Experiment[]> {
	if (options.limit != undefined && options.limit > 200)
		throw new TypeError('limit must be less than 200');

	const withRollouts = !!options.with_rollouts;
	const withAssignments = !!options.with_assignments;

	let json = await client
		.collection<Experiment>('experiments')
		.find({
			type: options.type ?? { $exists: !withRollouts ? true : undefined }
		})
		.skip(options.cursor ?? 0)
		.limit(options.limit ?? 50)
		.toArray()
		.then((docs) =>
			docs.map(
				(
					doc: Experiment & { _id?: ObjectId } & (
							| Partial<ExperimentRollout>
							| Partial<ExperimentAssignment>
						)
				) => {
					delete doc._id;

					doc.buckets = doc.buckets?.map((v) => ({
						...v,
						description:
							v.description?.replace(/^(Control|Treatment \d+)(: )?/, '') ||
							null
					}));

					if (!withRollouts && doc.type === 'guild') {
						delete doc.overrides;
						delete doc.overrides_formatted;
						delete doc.populations;
					}

					if (!withAssignments && doc.type === 'user') {
						delete doc.assignments;
					}

					return doc;
				}
			)
		);

	return json;
}
