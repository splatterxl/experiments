import { NextApiRequest, NextApiResponse } from 'next';
import { one } from '../../../../utils';
import { Endpoints } from '../../../../utils/constants/experiments';
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
}

export async function getExperiments(
	options: GetExperimentsOptions
): Promise<Experiment[]> {
	let json: ExperimentAether[];

	try {
		const raw = await fetch(Endpoints.LIST_AETHER);

		if (!raw.ok) {
			throw await raw.text();
		}

		json = await raw.json();
	} catch (err) {
		console.log(err);

		throw new Error('Bad Gateway');
	}

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

	return json.map((experiment) => {
		const result = {
			...experiment,
			type: experiment.type as 'user' | 'guild',
			id: experiment.id,
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
}
