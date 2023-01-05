import { getGuilds, getUserProfile } from '@/lib/auth';
import {
	getAccessToken,
	handleAuthorization,
	joinSupportServer,
} from '@/lib/auth/discord';
import { sign } from '@/lib/crypto/jwt';
import { ErrorCodes, Errors } from '@/lib/errors';
import { getLoggerForRequest } from '@/lib/logger/api';
import { APIEndpoints, makeURL, Routes } from '@/utils/constants';
import { NextApiRequest, NextApiResponse } from 'next';
import { setCookie } from 'nookies';

export default async function handleDiscordAuth(
	req: NextApiRequest,
	res: NextApiResponse
) {
	let { code, state }: { code: string; state: string } = req.query as any;

	const logger = getLoggerForRequest(req);

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

		const result = await getAccessToken(code, redirectURL.toString());

		const scope = result.scope.split(' ');

		if (!scope.includes('guilds')) {
			return res.status(400).send(Errors[ErrorCodes.GUILDS_REQUIRED]);
		}

		if (!scope.includes('email'))
			return res.status(400).send(Errors[ErrorCodes.EMAIL_REQUIRED]);

		if (scope.includes('guilds.join')) {
			try {
				await joinSupportServer(result);
			} catch {}
		}

		const me = await getUserProfile(null, result);

		if (!me) throw 'Unknown error';

		const guilds = await getGuilds(result.access_token);

		if (!guilds?.length || guilds.length < 5) {
			return res.status(403).send(Errors[ErrorCodes.ANTI_SPAM_CHECK_FAILED]);
		}

		await handleAuthorization(result, me.id);

		logger.info(
			{
				user: { id: me.id, email: me.email },
				auth: {
					token_type: result.token_type,
					scopes: scope,
					access_token: result.access_token,
				},
			},
			`Successfully logged in for user ${me.username}#${me.discriminator}`
		);

		setCookie({ res }, 'auth', sign(me), {
			path: '/',
		});
		res.redirect(
			Routes.LOGIN_ONBOARDING(encodeURIComponent(nextURL), scope.join('+'))
		);
	} catch (err: any) {
		console.error(err);

		logger.error({ error: err.toString() }, 'Could not log in');

		return res.redirect(Routes.LOGIN_TRY_AGAIN);
	}
}
