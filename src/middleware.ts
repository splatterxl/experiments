import { ErrorCodes, Errors } from '@/lib/errors';
import * as Sentry from '@sentry/nextjs';
import { NextRequest, NextResponse } from 'next/server';

export const config = {
	matcher: '/:path*',
};

export function middleware(request: NextRequest) {
	const uuid = crypto.randomUUID();

	const reqHeaders = new Headers(request.headers);

	reqHeaders.set('X-Request-Id', uuid);

	Sentry.configureScope((scope) => {
		scope.setTag('request-id', uuid);
	});

	if (request.nextUrl.pathname.startsWith('/api')) {
		if (!['GET', 'HEAD'].includes(request.method)) {
			if (
				request.body !== null &&
				!request.headers.get('Content-Type')?.startsWith('application/json')
			)
				return new NextResponse(
					JSON.stringify(Errors[ErrorCodes.INVALID_REQUEST_BODY]),
					{ status: 415, headers: { 'content-type': 'application/json' } }
				);
		}

		if (!request.nextUrl.pathname.startsWith('/api/v1')) {
			for (const header of [
				'accept',
				'host',
				'accept-encoding',
				'accept-language',
				'connection',
			])
				if (!request.headers.has(header))
					return new NextResponse(JSON.stringify(Errors[ErrorCodes.FRAUD]), {
						status: 403,
						headers: { 'content-type': 'application/json' },
					});
		}
	}

	const response = NextResponse.next({
		request: { headers: reqHeaders },
	});

	response.headers.set('X-Req-Id', uuid);

	if (response.status === 404) {
		return new NextResponse(JSON.stringify(Errors[ErrorCodes.NOT_FOUND]), {
			status: 404,
			headers: { 'content-type': 'application/json', 'x-req-id': uuid },
		});
	}

	return response;
}
