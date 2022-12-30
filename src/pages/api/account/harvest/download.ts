import { JWT_TOKEN } from '@/lib/crypto/jwt';
import { redis } from '@/lib/db';
import { authorizations, customers, subscriptions } from '@/lib/db/collections';
import { Authorization } from '@/lib/db/models';
import { ErrorCodes, Errors } from '@/lib/errors';
import { getLoggerForRequest } from '@/lib/logger/api';
import { Ratelimit } from '@upstash/ratelimit';
import { Snowflake } from 'discord-api-types/globals';
import { JwtPayload, verify } from 'jsonwebtoken';
import { WithId } from 'mongodb';
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

		const identifier = 'download_harvest:' + payload.user;
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
	const session: WithId<Partial<Authorization>> =
		(await authorizations().findOne({ user_id: user })) as any;

	delete session?.access_token;
	delete session?.refresh_token;

	return {
		subscriptions: await subscriptions().find({ user_id: user }).toArray(),
		session,
		customers: await customers().find({ user_id: user }).toArray(),
	};
}
