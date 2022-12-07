import { NextApiRequest, NextApiResponse } from 'next';
import { destroyCookie } from 'nookies';
import { Endpoints, makeDiscordURL } from '../../../utils/constants/discord';

export default async function Logout(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (!req.cookies.auth) return res.redirect('/');
	else {
		const { auth, refresh } = req.cookies;

		try {
			await fetch(makeDiscordURL(Endpoints.REVOKE_TOKEN, {}), {
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				method: 'POST',
				body: new URLSearchParams({
					token: auth,
					token_type_hint: 'access_token'
				}).toString()
			});
			if (refresh)
				await fetch(makeDiscordURL(Endpoints.REVOKE_TOKEN, {}), {
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
					method: 'POST',
					body: new URLSearchParams({
						token: refresh,
						token_type_hint: 'refresh_token'
					}).toString()
				});
		} catch (err) {
			console.log(err);
		}

		destroyCookie({ res }, 'auth', { path: '/' });
		destroyCookie({ res }, 'refresh', { path: '/' });

		return res.redirect('/');
	}
}
