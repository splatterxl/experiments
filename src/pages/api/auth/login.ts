import { NextApiRequest, NextApiResponse } from 'next';
import { parseCookies } from 'nookies';
import { one } from '../../../utils';
import {
	APP_ID,
	Endpoints,
	makeDiscordURL
} from '../../../utils/constants/discord';

export default function Login(req: NextApiRequest, res: NextApiResponse) {
	const cookies = parseCookies({ req });

	if (cookies.auth) return res.redirect('/dashboard');

	const scopes = one(req.query.scopes);

	let scope: { guilds: boolean; join: boolean };

	try {
		if (!scopes) throw 'no scopes';
		scope = JSON.parse(Buffer.from(scopes, 'base64').toString());
		if (!('guilds' in scope && 'join' in scope)) throw 'invalid scope object';
	} catch (err) {
		return res.redirect('/auth/login/try-again');
	}

	const appliedScope = ['identify', 'email'];

	if (scope.guilds) appliedScope.push('guilds');
	if (scope.join) appliedScope.push('guilds.join');

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
		scope: appliedScope.join(' '),
		redirect_uri: url.origin + '/api/auth/discord',
		response_type: 'code',
		state: Buffer.from(
			JSON.stringify({ next: one(req.query.next) ?? '/dashboard' })
		).toString('base64'),
		prompt: 'none'
	});

	return res.redirect(authorizeURL);
}
