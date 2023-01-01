import { getGuilds } from '@/lib/auth';
import { checkAuth } from '@/lib/auth/request';
import { ErrorCodes, Errors } from '@/lib/errors';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function getMyGuilds(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const auth = await checkAuth(req, res);

	if (!auth) return;

	auth.logger.debug('Fetched guilds for user');

	const resp = await getGuilds(auth.access_token);

	if (!resp) res.status(429).send(Errors[ErrorCodes.USER_LIMIT](2));
	else res.send(resp);
}
