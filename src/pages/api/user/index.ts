import { NextApiRequest, NextApiResponse } from 'next';
import { Endpoints, makeDiscordURL } from '../../../utils/constants/discord';
import { checkAuth } from '../../../utils/database';

export default async function getMyGuilds(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const auth = await checkAuth(req, res);

	if (!auth) return;

	const resp = await fetch(makeDiscordURL(Endpoints.ME, {}), {
		headers: { Authorization: `Bearer ${auth.access_token}` },
	});

	if (!resp) res.setHeader('Retry-After', '60').status(502).send('Bad Gateway');
	else res.send(resp);
}
