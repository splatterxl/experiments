import { APIUser } from 'discord-api-types/v10';
import { IncomingHttpHeaders } from 'http';
import { NextApiRequest } from 'next';
import { NextRequest } from 'next/server';
import pino from 'pino';
import { getClientIp } from 'request-ip';
import { Authorization } from '../db/models';

export const logger = pino({
	browser: {},
	level: 'debug',
	transport: {
		target: 'pino-pretty',
		options: {
			colorize: true,
		},
	},
	base: {
		env: process.env.NODE_ENV,
		revision: process.env.VERCEL_GITHUB_COMMIT_SHA,
	},
});

export const getLoggerForRequest = (
	req: NextApiRequest | NextRequest,
	requestId?: string
) =>
	logger.child({
		request: {
			ip: getClientIp({
				...req,
				headers:
					typeof req.headers.entries === 'function'
						? Object.fromEntries([...req.headers.entries()])
						: (req.headers as IncomingHttpHeaders),
			}),
			sentryTrace:
				// @ts-ignore
				req.headers['sentry-trace'] ?? req.headers.get?.('sentry-trace'),
			// @ts-ignore
			id: requestId ?? req.headers['x-request-id'],
			url: req.url,
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
