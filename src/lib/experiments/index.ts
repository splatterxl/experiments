import { experiments } from '@/lib/db/collections';
import {
	Experiment,
	ExperimentAssignment,
	ExperimentRollout,
} from '@/lib/db/models';
import { getExperimentRollout } from '@/lib/experiments/web';
import { ObjectId } from 'mongodb';

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
	const withAssignments = !!options.with_assignments;
	const withPercentages = !!options.with_percentages;

	let json = await getDbExperiments(options, withRollouts).then((docs) =>
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
						v.description?.replace(/^(Control|Treatment \d+)(: )?/, '') || null,
				}));

				if ((!withRollouts || withPercentages) && doc.type === 'guild') {
					delete doc.overrides;
					delete doc.overrides_formatted;
					delete doc.populations;
				}

				if (withPercentages && doc.type === 'guild') {
					doc.rollout = getExperimentRollout(doc as any);
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

export async function getExperiment(hash_key: number) {
	return experiments().findOne({ hash_key });
}
