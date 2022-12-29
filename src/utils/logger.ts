import { NextApiRequest } from 'next';
import pino from 'pino';
import { getClientIp } from 'request-ip';

const transport = pino.transport({
	target: 'pino-mongodb',
	options: {
		uri: process.env.MONGODB_URI,
		database: 'logs',
		collection: 'log-collection',
	},
});

export const logger = pino(transport);

export const getLogger = (req: NextApiRequest) =>
	logger.child({
		request: {
			ip: getClientIp(req),
			sentryTrace: req.headers['sentry-trace'],
			id: req.headers['x-request-id'],
		},
	});
