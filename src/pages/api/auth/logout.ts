import { revokeTokens } from '@/lib/auth/discord';
import { getAuth } from '@/lib/db';
import { ErrorCodes, Errors } from '@/lib/errors';
import { getLoggerForRequest, getLoggerForUser } from '@/lib/logger/api';
import { APIUser } from 'discord-api-types/v10';
import { decode } from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { destroyCookie } from 'nookies';
import { Routes } from '../../../utils/constants';

// This endpoint is navigated to directly by the frontend
export default async function Logout(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (!req.cookies.auth) return res.redirect(Routes.HOME);
	else {
		const user = decode(req.cookies.auth) as APIUser;

		destroyCookie({ res }, 'auth', { path: '/' });

		const auth = await getAuth(user.id);

		if (!auth) return res.redirect(Routes.HOME);

		const logger = getLoggerForUser(getLoggerForRequest(req), user, auth);

		try {
			await revokeTokens(auth, user.id);

			logger.info('Logged out successfully');

			return res.redirect(Routes.HOME);
		} catch (err: any) {
			console.log(err);

			logger.error({ error: err.toString() }, 'Logged out unsuccessfully');

			return res.status(500).send(Errors[ErrorCodes.INTERNAL_SERVER_ERROR]);
		}
	}
}
