import { experiments } from '@/lib/db/collections';
import {
	Experiment,
	ExperimentAssignment,
	ExperimentRollout,
} from '@/lib/db/models';
import { getExperimentRollout } from '@/lib/experiments/web';
import { ObjectId } from 'mongodb';
import murmurhash from 'murmurhash';

export interface GetExperimentsOptions {
	type?: 'user' | 'guild';
	q?: string;
	limit?: string;
	cursor?: string;
	with_rollouts?: boolean;
	with_assignments?: boolean;
	with_percentages?: boolean;
}

export async function getDbExperiments(
	options: GetExperimentsOptions,
	withRollouts?: boolean
) {
	const exps = await experiments()
		.find({
			...(options.type ?? !withRollouts
				? {
						type: options.type ?? { $exists: !withRollouts ? true : undefined },
				  }
				: {}),
			...(options.q ? { $text: { $search: options.q } } : {}),
		})
		.sort(
			options.q
				? {}
				: {
						name: -1,
				  }
		)
		.skip(parseInt(options.cursor ?? '0'))
		.limit(parseInt(options.limit ?? '50'))
		.toArray();

	return exps;
}

export async function getExperiments(
	options: GetExperimentsOptions
): Promise<Experiment[]> {
	if (options.limit != undefined && +options.limit > 200)
		throw new TypeError('limit must be less than 200');

	const withRollouts = !!options.with_rollouts;

	let json = await getDbExperiments(options, withRollouts).then((docs) =>
		docs.map((doc) => prepareDocument(options, doc, undefined, undefined))
	);

	return json;
}

export async function getExperiment(hash_key: number) {
	return experiments()
		.findOne({ hash_key })
		.then(
			(doc) =>
				doc &&
				prepareDocument(
					{
						with_assignments: true,
						with_rollouts: true,
					},
					doc
				)
		);
}

export async function getExperimentByName(name: string) {
	const isHash = !/^\d+$/.test(name);
	const hash = isHash ? murmurhash.v3(name) : null;

	const exp = await Promise.all(
		await experiments()
			.find({
				$or: [
					{ hash_key: hash ?? parseInt(name) },
					{
						name,
					},
				],
			})
			.toArray()
			.then((docs) =>
				docs.map(async (doc) => {
					const res = prepareDocument(
						{
							with_assignments: true,
							with_rollouts: true,
						},
						doc,
						hash ?? undefined,
						name
					);

					if (doc && isHash && doc.hash_key === hash) {
						res.hash_name = name;
					}

					return res;
				})
			)
	);

	return exp.length === 1 ? exp[0] : exp.length === 0 ? null : exp;
}

export function prepareDocument(
	options: GetExperimentsOptions,
	doc: Experiment & { _id?: ObjectId } & (
			| Partial<ExperimentRollout>
			| Partial<ExperimentAssignment>
		),
	hash?: number,
	hashKey?: string
) {
	delete doc._id;

	doc.buckets = doc.buckets?.map((v) => ({
		...v,
		description:
			v.description?.replace(/^(Control|Treatment \d+)(: )?/, '') || null,
	}));

	// @ts-ignore
	if (doc.populations || doc.overrides || doc.overrides_formatted) {
		doc.type = 'guild';

		if (doc.type === 'guild') {
			doc.buckets ??= [
				...new Set(
					(doc.overrides?.map((v) => v.b) ?? [])
						.concat(
							doc.overrides_formatted?.flatMap((v) =>
								v
									?.flatMap((pop) => pop.rollout.flatMap((r) => r.bucket))
									?.flat(3)
							) ?? []
						)
						.concat(
							doc.populations?.flatMap((pop) =>
								pop.rollout.flatMap((r) => r.bucket)
							) ?? []
						)
						.filter((v) => v !== -1)
				),
			].map((b) => ({
				name: b === 0 ? `Control` : `Treatment ${b}`,
				description: (doc.name ?? hashKey)?.includes('holdout')
					? b !== 0
						? 'Enable dependent experiment'
						: 'Disable dependent experiment'
					: null,
			}));
		}
	}

	// @ts-ignore
	if (doc.assignments) {
		doc.type = 'user';
	}

	if (
		(!options.with_rollouts || options.with_percentages) &&
		doc.type === 'guild'
	) {
		delete doc.overrides;
		delete doc.overrides_formatted;
		delete doc.populations;
	}

	if (options.with_percentages && doc.type === 'guild') {
		doc.rollout = getExperimentRollout(doc as any);
	}

	if (!options.with_assignments && doc.type === 'user') {
		delete doc.assignments;
	}

	return doc;
}
