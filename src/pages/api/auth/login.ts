import { NextApiRequest, NextApiResponse } from 'next';
import { parseCookies } from 'nookies';
import { one } from '../../../utils';
import { APIEndpoints, makeURL, Routes } from '../../../utils/constants';
import {
	APP_ID,
	Endpoints,
	makeDiscordURL,
} from '../../../utils/constants/discord';

export default function Login(req: NextApiRequest, res: NextApiResponse) {
	const cookies = parseCookies({ req });

	let nextURL = Routes.DASHBOARD;

	if (req.query.next)
		try {
			nextURL = new URL(one(req.query.next), 'https://google.com').pathname;
		} catch {}

	if (cookies.auth) return res.redirect(nextURL);

	const join = Boolean(one(req.query.join));

	const scope = ['identify', 'email', 'guilds'];

	if (join) scope.push('guilds.join');

	const host = req.headers.host;

	if (!host) return res.status(400).send({ error: 'Invalid host' });

	const url = new URL(
		req.url!,
		process.env.NODE_ENV === 'development'
			? `http://${host}`
			: `https://${host}`
	);

	const authorizeURL = makeDiscordURL(Endpoints.OAUTH2_AUTH, {
		client_id: APP_ID,
		scope: scope.join(' '),
		redirect_uri: url.origin + makeURL(APIEndpoints.DISCORD_CALLBACK),
		response_type: 'code',
		state: Buffer.from(JSON.stringify({ next: nextURL })).toString('base64'),
		prompt: 'none',
	});

	return res.redirect(authorizeURL);
}
