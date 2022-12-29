import { APIGuild } from 'discord-api-types/v10';
import { NextApiRequest, NextApiResponse } from 'next';
import { sleep } from '../../../utils';
import { Endpoints, makeDiscordURL } from '../../../utils/constants/discord';
import { checkAuth } from '../../../utils/database';

export default async function getMyGuilds(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const auth = await checkAuth(req, res);

	if (!auth) return;

	auth.logger.debug('Fetched guilds for user');

	const resp = await getGuilds(auth.access_token);

	if (!resp) res.status(502).send('Bad Gateway');
	else res.send(resp);
}

export const getGuilds = async (
	access_token: string
): Promise<APIGuild[] | undefined> => {
	function get() {
		return fetch(makeDiscordURL(Endpoints.GUILDS, {}), {
			headers: { Authorization: `Bearer ${access_token}` },
		});
	}

	let res = await get();

	let i = 0;

	while (res.status === 429 && i < 2) {
		await sleep(
			parseInt(res.headers.get('x-ratelimit-reset')!) * 1000 - Date.now()
		);

		res = await get();

		i++;
	}

	if (res.status === 429) return undefined;

	const json = await res.json();

	if (!res.ok) console.error(json);
	else return json;
};
