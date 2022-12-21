import { Ratelimit } from '@upstash/ratelimit';
import { Snowflake } from 'discord-api-types/globals';
import { JwtPayload, verify } from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { getClientIp } from 'request-ip';
import { one } from '../../../../utils';
import { client, redis } from '../../../../utils/database';
import { JWT_TOKEN } from '../../../../utils/jwt';

const ratelimit = new Ratelimit({
	redis: redis,
	limiter: Ratelimit.fixedWindow(5, '1 d')
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
				message: 'Harvest expiration date invalid'
			};

		const identifier =
			'download_harvest:' + payload.user + ':' + getClientIp(req);
		const result = await ratelimit.limit(identifier);
		res.setHeader('X-RateLimit-Limit', result.limit);
		res.setHeader('X-RateLimit-Remaining', result.remaining);
		res.setHeader('X-RateLimit-Reset', result.reset);

		if (!result.success) {
			res.status(429).json({
				message: 'The request has been rate limited.',
				reset_after: (result.reset - Date.now()) / 1000
			});
			return;
		}

		res.setHeader('Content-Disposition', 'attachment; filename=package.json;');

		res.send(await getHarvest(payload.user));
	} catch (err) {
		res.status(404).send({
			error: 'Unknown data harvest',
			internal: process.env.NODE_ENV === 'development' ? err : undefined
		});
	}
}

async function getHarvest(user: Snowflake) {
	const subscriptions = await client
		.collection('subscriptions')
		.find({ user_id: user })
		.toArray();

	const session = await client.collection('auth').findOne({ user_id: user });

	delete session?.access_token;
	delete session?.refresh_token;

	return { subscriptions, session };
}
