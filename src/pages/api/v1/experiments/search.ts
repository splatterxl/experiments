import { redis } from '@/lib/db';
import { Experiment } from '@/lib/db/models';
import { ErrorCodes, Errors } from '@/lib/errors';
import { getExperiments, GetExperimentsOptions } from '@/lib/experiments';
import { Ratelimit } from '@upstash/ratelimit';
import FuzzySearch from 'fuzzy-search';
import { NextApiRequest, NextApiResponse } from 'next';
import { getClientIp } from 'request-ip';

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

		res.send(await getBySearch(req.query));
	} catch (err: any) {
		res.status(400).send({ message: err.message });
	}
}

export async function getBySearch(options: GetExperimentsOptions) {
	let { q: search } = options;

	const experiments = await getExperiments(options);

	if (experiments === null) return null;

	let result: Experiment[];

	if (search) {
		const fuzzy = new FuzzySearch(experiments, ['title', 'id'], {
			caseSensitive: false,
			sort: true,
		});

		result = fuzzy.search(search);
	} else {
		result = experiments;
	}

	return result;
}
