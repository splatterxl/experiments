import { client } from '@/lib/db';
import { authorizations } from '@/lib/db/collections';
import { getLoggerForRequest, getLoggerForUser } from '@/lib/logger/api';
import { APIUser } from 'discord-api-types/v10';
import { decode } from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { destroyCookie } from 'nookies';
import { Routes } from '../../../utils/constants';
import { Endpoints, makeDiscordURL } from '../../../utils/constants/discord';

// This endpoint is navigated to directly by the frontend
export default async function Logout(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (!req.cookies.auth) return res.redirect(Routes.HOME);
	else {
		const user = decode(req.cookies.auth) as APIUser;

		destroyCookie({ res }, 'auth', { path: '/' });

		const auth = await authorizations().findOne({ user_id: user.id });

		if (!auth) return res.redirect(Routes.HOME);

		const logger = getLoggerForUser(getLoggerForRequest(req), user, auth);

		// TODO: move this to @/lib/auth/discord.ts
		try {
			await fetch(makeDiscordURL(Endpoints.REVOKE_TOKEN, {}), {
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				method: 'POST',
				body: new URLSearchParams({
					token: auth.access_token,
					token_type_hint: 'access_token',
				}).toString(),
			});
			if (auth.refresh_token)
				await fetch(makeDiscordURL(Endpoints.REVOKE_TOKEN, {}), {
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
					method: 'POST',
					body: new URLSearchParams({
						token: auth.refresh_token,
						token_type_hint: 'refresh_token',
					}).toString(),
				});

			await client.collection('auth').deleteMany({ user_id: user.id });

			logger.info('Logged out successfully');
		} catch (err: any) {
			console.log(err);

			logger.error({ error: err.toString() }, 'Logged out unsuccessfully');
		}

		return res.redirect(Routes.HOME);
	}
}
