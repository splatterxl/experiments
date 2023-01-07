import { NextApiRequest, NextApiResponse } from 'next';
import { getBySearch } from './search';

export default async function listExperiments(
	req: NextApiRequest,
	res: NextApiResponse
) {
	try {
		delete req.query.q;

		res.send(await getBySearch(req.query as any));
	} catch (err: any) {
		res.status(400).send({ message: err.message });
	}
}
