import { handleAuthorization, refreshToken } from '@/lib/auth/discord';
import { ErrorCodes, Errors } from '@/lib/errors';
import { APIUser, Snowflake } from 'discord-api-types/v10';
import {
	GetServerSidePropsContext,
	NextApiRequest,
	NextApiResponse,
} from 'next';
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

		const arr = await checkAuthRaw(req);

		if (!arr) {
			await logout(res);
			return;
		}

		const [json, auth] = arr;

		setCookie({ res }, 'auth', sign(json), { path: '/' });

		return {
			...json,
			access_token: auth.access_token,
			logger: getLoggerForUser(logger, json, auth),
		};
	}
};

async function logout(res: NextApiResponse, userId?: Snowflake) {
	destroyCookie({ res }, 'auth', { path: '/' });

	// TODO: implement refreshing

	if (userId) await authorizations().deleteMany({ user_id: userId });

	res.status(401).send(Errors[ErrorCodes.AUTH_EXPIRED]);
}

export async function checkAuthRaw(req: GetServerSidePropsContext['req']) {
	if (!req.cookies.auth) {
		return null;
	}

	try {
		const { id } = verify<APIUser>(req.cookies.auth);

		let auth = await getAuthorization(id);

		if (!auth) return null;

		let json = await getUserProfile(id, auth);

		if (!json) {
			// try refreshing

			try {
				const refreshed = await refreshToken(auth.refresh_token);

				auth = await handleAuthorization(refreshed, id);

				json = await getUserProfile(id, refreshed);

				if (!json) return null;
			} catch {
				return null;
			}
		}

		return json ? [json, auth] : null;
	} catch {
		return null;
	}
}

export async function checkAuthProps(context: GetServerSidePropsContext) {
	const arr = await checkAuthRaw(context.req);

	if (!arr) {
		destroyCookie(context, 'auth', { path: '/' });

		return null;
	} else {
		return arr;
	}
}
