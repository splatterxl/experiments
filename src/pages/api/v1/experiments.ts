import FuzzySearch from 'fuzzy-search';
import { NextApiRequest, NextApiResponse } from 'next';
import { one } from '../../../utils';
import { Endpoints } from '../../../utils/constants/experiments';

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
	buckets: Record<number, string>;
	id: string;
	hash: number;
}

export default async function listExperiments(
	req: NextApiRequest,
	res: NextApiResponse
) {
	let json: ExperimentAether[];

	try {
		const nelly = await fetch(Endpoints.LIST_AETHER);

		if (!nelly.ok) {
			throw await nelly.text();
		}

		json = await nelly.json();
	} catch (err) {
		console.log(err);
		return res.status(502).send({ error: 'Bad Gateway' });
	}

	const query = one(req.query.type);

	if (query) {
		switch (query) {
			case 'user':
				json = json.filter((v) => v.type === 'user');
				break;
			case 'guild':
				json = json.filter((v) => v.type === 'guild');
				break;
			default:
				return res.status(400).send({ error: 'Invalid filter' });
		}
	}

	const experiments = json.map((experiment) => {
		const result = {
			...experiment,
			description: undefined,
			buckets: Array.from(experiment.buckets as number[], (v, i) => ({
				name: i === 0 ? 'Control' : `Treatment ${i}`,
				description:
					experiment.description![i].replace(
						/^(Control|Treatment \d+)(: )?/,
						''
					) || null
			}))
		};

		return result;
	});

	const search = one(req.query.search);

	if (search) {
		const fuzzy = new FuzzySearch(experiments, ['title', 'id'], {
			caseSensitive: false,
			sort: true
		});

		const result = fuzzy.search(search);

		if (!result.length)
			return res.status(404).send({ error: 'No such experiment(s)' });
		else return res.send(result);
	} else {
		return res.send(experiments);
	}
}
