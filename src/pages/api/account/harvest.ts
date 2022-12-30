import { checkAuth } from '@/lib/auth/request';
import { JWT_TOKEN } from '@/lib/crypto/jwt';
import { redis } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { Templates } from '@/lib/email/constants';
import { ErrorCodes, Errors } from '@/lib/errors';
import { getOrigin } from '@/lib/util';
import { Ratelimit } from '@upstash/ratelimit';
import { sign } from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { APIEndpoints, makeURL } from '../../../utils/constants';

const ratelimit = new Ratelimit({
	redis: redis,
	limiter: Ratelimit.fixedWindow(1, '30 d'),
});

export default async function startHarvest(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const user = await checkAuth(req, res);

	if (!user) return;

	if (req.method !== 'POST')
		return res.status(405).send(Errors[ErrorCodes.METHOD_NOT_ALLOWED]);

	const identifier = 'start_harvest:' + user.id;
	const result = await ratelimit.limit(identifier);

	if (!result.success) {
		res.setHeader('X-RateLimit-Limit', result.limit);
		res.setHeader('X-RateLimit-Remaining', result.remaining);
		res.setHeader('X-RateLimit-Reset', result.reset);
		res.setHeader('Retry-After', (result.reset - Date.now()) / 1000);

		res.status(429).json(Errors[ErrorCodes.HARVEST_ALREADY_IN_PROGRESS]);
		return;
	}

	const origin = getOrigin(req, res);

	if (!origin) return;

	const email = await sendEmail(
		{
			email: user.email!,
			name: user.username,
		},
		{
			template: Templates.HARVEST,
			subject: 'Your data is ready!',
			variables: {
				email: user.email!,
				substitutions: [
					{
						var: 'name',
						value: user.username,
					},
					{
						var: 'download_url',
						value: `${origin}${makeURL(APIEndpoints.DOWNLOAD_HARVEST, {
							_: sign(
								{
									user: user.id,
									email: user.email,
								},
								JWT_TOKEN,
								{ expiresIn: '30d' }
							),
						})}`,
					},
				],
			},
		}
	);

	res.status(email.status).send(email);
}
