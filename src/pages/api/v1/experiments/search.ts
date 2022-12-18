import FuzzySearch from 'fuzzy-search';
import { NextApiRequest, NextApiResponse } from 'next';
import { paginate } from '../../../../utils';
import { Experiment, getExperiments, GetExperimentsOptions } from './[type]';

export default async function searchExperiments(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { q } = req.query;

	if (!q) res.status(400).send({ error: 'No query' });

	try {
		res.send(await getBySearch(req.query as any));
	} catch (err: any) {
		res.status(400).send({ error: err.message });
	}
}

export async function getBySearch(options: GetExperimentsOptions) {
	let { q: search, limit, cursor } = options;

	const experiments = await getExperiments(options);

	if (experiments === null) return null;

	let result: Experiment[];

	if (search) {
		const fuzzy = new FuzzySearch(experiments, ['title', 'id'], {
			caseSensitive: false,
			sort: true
		});

		result = fuzzy.search(search);
	} else {
		result = experiments;
	}

	return paginate(result, { limit, cursor });
}
