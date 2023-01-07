import { redis } from '@/lib/db';
import { ErrorCodes, Errors } from '@/lib/errors';
import { Ratelimit } from '@upstash/ratelimit';
import { NextApiRequest, NextApiResponse } from 'next';
import { getClientIp } from 'request-ip';
import { getBySearch } from './search';

const ratelimit = new Ratelimit({
	redis: redis,
	limiter: Ratelimit.fixedWindow(2, '30 m'),
});

export default async function listExperiments(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const identifier = 'exps:' + getClientIp(req);
	const result = await ratelimit.limit(identifier);
	res.setHeader('X-RateLimit-Limit', result.limit);
	res.setHeader('X-RateLimit-Remaining', result.remaining);
	res.setHeader('X-RateLimit-Reset', result.reset);

	if (!result.success) {
		res
			.setHeader('Retry-After', (result.reset - Date.now()) / 1000)
			.status(429)
			.json(Errors[ErrorCodes.USER_LIMIT]((result.reset - Date.now()) / 1000));
		return;
	}

	try {
		delete req.query.q;

		res.send(await getBySearch(req.query as any));
	} catch (err: any) {
		res.status(400).send({ message: err.message });
	}
}
