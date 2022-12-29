import { Ratelimit } from '@upstash/ratelimit';
import { sign } from 'jsonwebtoken';
import { EmailParams, Recipient } from 'mailersend';
import { NextApiRequest, NextApiResponse } from 'next';
import { from, mailersend } from '../../../utils/billing/email';
import { APIEndpoints, makeURL } from '../../../utils/constants';
import { checkAuth, redis } from '../../../utils/database';
import { JWT_TOKEN } from '../../../utils/jwt';

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
		return res.status(405).send({ message: 'Method Not Allowed' });

	const identifier = 'start_harvest:' + user.id;
	const result = await ratelimit.limit(identifier);

	if (!result.success) {
		res.setHeader('X-RateLimit-Limit', result.limit);
		res.setHeader('X-RateLimit-Remaining', result.remaining);
		res.setHeader('X-RateLimit-Reset', result.reset);
		res.setHeader('Retry-After', (result.reset - Date.now()) / 1000);

		res.status(429).json({
			message: 'Data harvest already in progress.',
		});
		return;
	}

	const host = req.headers.host;

	if (!host) return res.status(400).send({ error: 'Invalid host' });

	const url = new URL(
		req.url!,
		process.env.NODE_ENV === 'development'
			? `http://${host}`
			: `https://${host}`
	);

	const recipients = [new Recipient(user.email!, user.username)];

	const variables = [
		{
			email: user.email!,
			substitutions: [
				{
					var: 'name',
					value: user.username,
				},
				{
					var: 'download_url',
					value: `${url.origin}${makeURL(APIEndpoints.DOWNLOAD_HARVEST, {
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
	];

	const emailParams = new EmailParams()
		.setFrom(from.email)
		.setFromName(from.name)
		.setRecipients(recipients)
		.setSubject('Your data is ready!')
		.setTemplateId('3z0vkloq0wx47qrx')
		.setVariables(variables as any);

	const email = (await mailersend.send(emailParams)) as Response;

	res.send({
		email: email.status === 202 ? 'sent' : 'error',
		message:
			email.status === 202
				? 'We have sent your data to your Discord email address.'
				: 'An unknown error occured. Sorry!',
	});

	if (!email.ok) {
		const json = await email.json();

		user.logger.error(
			{
				error: json,
			},
			'Could not send user data to email'
		);
	}
}
