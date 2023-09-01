import { redis } from '@/lib/db';
import { ErrorCodes, Errors } from '@/lib/errors';
import { getExperimentByName } from '@/lib/experiments';
import { Ratelimit } from '@upstash/ratelimit';
import { NextApiRequest, NextApiResponse } from 'next';
import { getClientIp } from 'request-ip';
import { getBySearch } from './search';

const expsRatelimit = new Ratelimit({
	redis: redis,
	limiter: Ratelimit.fixedWindow(2, '30 m'),
});
const individualRatelimit = new Ratelimit({
	redis,
	limiter: Ratelimit.slidingWindow(5, '10m'),
});

export default async function listExperiments(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const identifier = ['user', 'guild'].includes(req.body.type_or_id)
		? 'exps:' + getClientIp(req)
		: 'exp:' + getClientIp(req) + ':' + req.body.type_or_id;
	const result = await (['user', 'guild'].includes(req.body.type_or_id)
		? expsRatelimit
		: individualRatelimit
	).limit(identifier);
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

	if (['user', 'guild'].includes(req.body.type_or_id)) {
		try {
			delete req.query.q;

			res.send(
				await getBySearch({ ...(req.query as any), type: req.query.type_or_id })
			);
		} catch (err: any) {
			res.status(400).send({ message: err.message });
		}
	} else {
		if (!req.query.type_or_id)
			return res.status(400).send({ message: 'experiment id is required' });

		const exp = await getExperimentByName(req.query.type_or_id!.toString());

		if (exp) res.send(exp);
		else res.status(404).send({ message: 'Not found' });
	}
}
