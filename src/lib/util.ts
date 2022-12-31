import { ErrorCodes, Errors } from '@/lib/errors';
import { IncomingMessage } from 'http';
import { NextApiResponse } from 'next';

export interface PaginationOptions {
	limit?: number;
	cursor?: number;
}

export interface Pagination<T> {
	hits: number;
	position: { start: number; end: number; remaining: number } | null;
	results: T[];
}

export function paginate<T>(
	result: T[],
	options: PaginationOptions
): Pagination<T> {
	let { limit, cursor } = options;

	limit = parseInt(limit?.toString() ?? '50');

	if (isNaN(limit) || limit > 200) throw new TypeError('Invalid limit');

	cursor = parseInt(cursor?.toString() ?? '0');

	if (isNaN(cursor) || (result.length && cursor >= result.length))
		throw new TypeError('Invalid cursor');

	const sliced = result.slice(cursor, cursor + limit);

	return {
		hits: result.length,
		position:
			sliced.length !== result.length
				? {
						start: cursor,
						end: sliced.length + cursor,
						remaining: result.length - (sliced.length + cursor),
				  }
				: null,
		results: sliced,
	};
}

export const getOrigin = (
	req: IncomingMessage,
	res?: NextApiResponse
): string => {
	const host = req.headers.host;

	if (!host) {
		if (res) res.status(400).send(Errors[ErrorCodes.INVALID_HOST]);

		return null as any;
	}

	try {
		const url = new URL(
			req.url!,
			process.env.NODE_ENV === 'development'
				? `http://${host}`
				: `https://${host}`
		);

		return url.origin;
	} catch {
		if (res) res.status(400).send(Errors[ErrorCodes.INVALID_HOST]);

		return null as any;
	}
};
