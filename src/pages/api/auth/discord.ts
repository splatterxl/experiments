import type {
	APIUser,
	RESTGetAPICurrentUserGuildsResult,
	RESTPostOAuth2AccessTokenResult,
} from 'discord-api-types/v10';
import { sign } from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { setCookie } from 'nookies';
import { APIEndpoints, makeURL, Routes } from '../../../utils/constants';
import {
	APP_ID,
	Endpoints,
	GUILD_INVITE,
	makeDiscordURL,
} from '../../../utils/constants/discord';
import { Authorization, client } from '../../../utils/database';
import { request } from '../../../utils/http';
import { JWT_TOKEN } from '../../../utils/jwt';

export default async function handleDiscordAuth(
	req: NextApiRequest,
	res: NextApiResponse
) {
	let { code, state }: { code: string; state: string } = req.query as any;

	try {
		const nextURL = new URL(
			JSON.parse(Buffer.from(state ?? '', 'base64').toString()).next,
			'https://google.com'
		).pathname;

		const host = req.headers.host;

		if (!host) return res.status(400).send({ error: 'Invalid host' });

		const redirectURL = new URL(
			makeURL(APIEndpoints.DISCORD_CALLBACK),
			process.env.NODE_ENV === 'development'
				? `http://${host}`
				: `https://${host}`
		);

		const json: RESTPostOAuth2AccessTokenResult = await fetch(
			makeDiscordURL(Endpoints.EXCHANGE, {}),
			{
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: new URLSearchParams({
					client_id: APP_ID,
					client_secret: process.env.DISCORD_CLIENT_SECRET,
					grant_type: 'authorization_code',
					code: code,
					redirect_uri: redirectURL,
				} as any).toString(),
				method: 'POST',
			}
		).then((res) => res.json());

		if ('error' in json) {
			throw json;
		} else {
			const {
				access_token,
				refresh_token,
				scope: discordScope,
				token_type,
				expires_in,
			} = json;
			const scope = discordScope.split(' ');

			if (scope.includes('guilds.join')) {
				try {
					await fetch(
						makeDiscordURL(Endpoints.ACCEPT_INVITE(GUILD_INVITE), {}),
						{
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
								Authorization: `${token_type} ${access_token}`,
							},
							body: JSON.stringify({}),
						}
					);
				} catch {}
			}

			if (!scope.includes('guilds')) {
				return res.status(400).send({
					message:
						'To prevent spam and fraud across our services, we ask for read-only access to your servers list.',
				});
			}

			const me: APIUser = await request(makeDiscordURL(Endpoints.ME, {}), {
				method: 'GET',
				headers: {
					Authorization: `${token_type} ${access_token}`,
				},
			}).then((res) => res.json());

			if (!me.id) throw 'Unknown error';

			const guilds: RESTGetAPICurrentUserGuildsResult = await request(
				makeDiscordURL(Endpoints.GUILDS, {}),
				{
					method: 'GET',
					headers: {
						Authorization: `${token_type} ${access_token}`,
					},
				}
			).then((res) => res.json());

			if (!guilds?.length || guilds.length < 5) {
				return res.status(403).send({
					message:
						'To prevent spam and fraud across our systems, we require Discord accounts to be legitimate to log in.',
				});
			}

			const coll = client.collection<Authorization>('auth');

			await coll.updateOne(
				{ user_id: me.id },
				{
					$set: {
						access_token,
						refresh_token,
						expires: new Date(Date.now() + expires_in * 1000),
						token_type,
						scope,
						user_id: me.id,
					},
				},
				{
					upsert: true,
				}
			);

			setCookie(
				{ res },
				'auth',
				sign(me, JWT_TOKEN, {
					expiresIn: expires_in,
				}),
				{
					path: '/',
				}
			);
			res.redirect(
				Routes.LOGIN_ONBOARDING(encodeURIComponent(nextURL), scope.join('+'))
			);
		}
	} catch (err) {
		console.log(err);

		return res.redirect(Routes.LOGIN_TRY_AGAIN);
	}
}
