import type { RESTPostOAuth2AccessTokenResult } from 'discord-api-types/v10';
import { NextApiRequest, NextApiResponse } from 'next';
import { setCookie } from 'nookies';
import {
	APP_ID,
	Endpoints,
	GUILD_INVITE,
	makeDiscordURL
} from '../../../utils/constants/discord';

const ErrorUrls = {
	TRY_AGAIN: '/auth/login/try-again'
};

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
			'/api/auth/discord',
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
					redirect_uri: redirectURL
				} as any).toString(),
				method: 'POST'
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
				expires_in
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
								Authorization: `${token_type} ${access_token}`
							},
							body: JSON.stringify({})
						}
					);
				} catch {}
			}

			setCookie({ res }, 'auth', access_token, {
				maxAge: expires_in,
				path: '/'
			});
			setCookie({ res }, 'refresh', refresh_token, {
				maxAge: expires_in,
				path: '/'
			});
			res.redirect(`/auth/login/onboarding?scope=${scope.join('+')}`);
		}
	} catch (err) {
		console.log(err);
		return res.redirect(ErrorUrls.TRY_AGAIN);
	}
}
