import { getSubscriptions } from '@/lib/billing/subscriptions';
import { JWT_TOKEN } from '@/lib/crypto/jwt';
import { db, getAuth, getDbCustomer, redis } from '@/lib/db';
import { ErrorCodes, Errors } from '@/lib/errors';
import { getLoggerForRequest } from '@/lib/logger/api';
import { Ratelimit } from '@upstash/ratelimit';
import { Snowflake } from 'discord-api-types/globals';
import { JwtPayload, verify } from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { one } from '../../../../utils';

const ratelimit = new Ratelimit({
	redis: redis,
	limiter: Ratelimit.fixedWindow(5, '1 d'),
});

export default async function downloadHarvest(
	req: NextApiRequest,
	res: NextApiResponse
) {
	let { _: jwt } = req.query;

	jwt = one(jwt);

	if (!jwt) return { error: 'Invalid authentication token' };

	try {
		const payload = verify(jwt, JWT_TOKEN) as JwtPayload;

		if (!payload.exp || Date.now() / 1000 > payload.exp!)
			throw {
				message: 'Harvest expiration date invalid',
			};

		const identifier = 'download-harvest:' + payload.user;
		const result = await ratelimit.limit(identifier);
		res.setHeader('X-RateLimit-Limit', result.limit);
		res.setHeader('X-RateLimit-Remaining', result.remaining);
		res.setHeader('X-RateLimit-Reset', result.reset);

		if (!result.success) {
			res
				.setHeader('Retry-After', (result.reset - Date.now()) / 1000)
				.status(429)
				.json(
					Errors[ErrorCodes.RESOURCE_LIMIT]((result.reset - Date.now()) / 1000)
				);
			return;
		}

		getLoggerForRequest(req).debug(
			{ user: { id: payload.user } },
			'User downloaded data harvest'
		);

		if (process.env.NODE_ENV !== 'development')
			res.setHeader(
				'Content-Disposition',
				'attachment; filename=package.json;'
			);

		res.send(await getHarvest(payload.user));
	} catch (err) {
		res.status(404).send(Errors[ErrorCodes.UNKNOWN_HARVEST]);
	}
}

async function getHarvest(user: Snowflake) {
	const session: any = await getAuth(user);

	delete session?.access_token;
	delete session?.refresh_token;

	return {
		subscriptions: await getSubscriptions(user),
		session,
		customer: await getDbCustomer(user),
		activity: await db
			.db('logs')
			.collection('log-collection')
			.find({
				'user.id': user,
			})
			.toArray()
			.then((activity) =>
				activity.map((act) => {
					delete act?.auth?.access_token;

					return act;
				})
			),
	};
}
