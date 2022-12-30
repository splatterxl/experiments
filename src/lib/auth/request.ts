import { ErrorCodes, Errors } from '@/lib/errors';
import { APIUser, Snowflake } from 'discord-api-types/v10';
import { NextApiRequest, NextApiResponse } from 'next';
import { destroyCookie, setCookie } from 'nookies';
import { getAuthorization, getUserProfile } from '.';
import { sign, verify } from '../crypto/jwt';
import { authorizations } from '../db/collections';
import { getLoggerForRequest, getLoggerForUser } from '../logger/api';

export const checkAuth = async (
	req: NextApiRequest,
	res: NextApiResponse
): Promise<
	(APIUser & { access_token: string; logger: import('pino').Logger }) | void
> => {
	if (!req.cookies.auth && !req.headers.authorization) {
		return res.status(401).send(Errors[ErrorCodes.LOGIN]);
	}

	if (req.headers.authorization) {
	} else if (req.cookies.auth) {
		const logger = getLoggerForRequest(req);

		try {
			const { id } = verify<APIUser>(req.cookies.auth);

			const auth = await getAuthorization(id);

			if (!auth) {
				await logout(res);

				return;
			}

			const json = await getUserProfile(id, auth);

			setCookie({ res }, 'auth', sign(json), { path: '/' });

			return {
				...json,
				access_token: auth.access_token,
				logger: getLoggerForUser(logger, json, auth),
			};
		} catch (err: any) {
			console.error(err);

			logger.error(
				{ error: err.toString() },
				'Could not verify authentication'
			);

			try {
				await logout(res);
			} catch {
				// there's a chance the response will already have been sent
			}
		}
	}
};

async function logout(res: NextApiResponse, userId?: Snowflake) {
	destroyCookie({ res }, 'auth', { path: '/' });
	destroyCookie({ res }, 'refresh', { path: '/' });

	// TODO: implement refreshing

	if (userId) await authorizations().deleteMany({ user_id: userId });

	res.status(401).send(Errors[ErrorCodes.AUTH_EXPIRED]);
}
