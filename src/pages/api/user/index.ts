import { NextApiRequest, NextApiResponse } from 'next';
import { checkAuth } from '../../../utils/database';

export default async function getMyGuilds(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const auth = await checkAuth(req, res);

	if (!auth) return;

	// @ts-ignore
	delete auth.access_token;

	res.send(auth);
}
