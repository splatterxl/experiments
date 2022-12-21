import { decode, JwtPayload } from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { destroyCookie } from 'nookies';
import { Endpoints, makeDiscordURL } from '../../../utils/constants/discord';
import { client } from '../../../utils/database';

// This endpoint is navigated to directly by the frontend
export default async function Logout(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (!req.cookies.auth) return res.redirect('/');
	else {
		const user = decode(req.cookies.auth) as JwtPayload;

		const auth = await client.collection('auth').findOne({ user_id: user.id });

		if (!auth) return res.redirect('/');

		try {
			await fetch(makeDiscordURL(Endpoints.REVOKE_TOKEN, {}), {
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				method: 'POST',
				body: new URLSearchParams({
					token: auth.access_token,
					token_type_hint: 'access_token'
				}).toString()
			});
			if (auth.refresh_token)
				await fetch(makeDiscordURL(Endpoints.REVOKE_TOKEN, {}), {
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
					method: 'POST',
					body: new URLSearchParams({
						token: auth.refresh_token,
						token_type_hint: 'refresh_token'
					}).toString()
				});

			await client.collection('auth').deleteMany({ user_id: user.id });
		} catch (err) {
			console.log(err);
		}

		destroyCookie({ res }, 'auth', { path: '/' });

		return res.redirect('/');
	}
}
