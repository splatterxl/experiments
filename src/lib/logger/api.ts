import { APIUser } from 'discord-api-types/v10';
import { NextApiRequest } from 'next';
import pino from 'pino';
import { getClientIp } from 'request-ip';
import { Authorization } from '../db/models';

const transport = pino.transport({
	target: 'pino-mongodb',
	options: {
		uri: process.env.MONGODB_URI,
		database: 'logs',
		collection: 'log-collection',
	},
});

export const logger = pino(transport);

export const getLoggerForRequest = (req: NextApiRequest) =>
	logger.child({
		request: {
			ip: getClientIp(req),
			sentryTrace: req.headers['sentry-trace'],
			id: req.headers['x-request-id'],
		},
	});

export const getLoggerForUser = (
	reqLogger: pino.Logger,
	user: APIUser,
	auth: Authorization
) =>
	reqLogger.child({
		user: { id: user.id, email: user.email },
		auth: {
			token_type: auth.token_type,
			scopes: auth.scope,
			access_token: auth.access_token,
		},
	});
