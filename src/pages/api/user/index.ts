import { checkAuth } from '@/lib/auth/request';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function getMyGuilds(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const auth = await checkAuth(req, res);

	if (!auth) return;

	// @ts-ignore
	delete auth.access_token;
	// @ts-ignore
	delete auth.logger;

	res.send(auth);
}
