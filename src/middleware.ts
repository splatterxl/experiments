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

	const response = NextResponse.next({
		request: { headers: reqHeaders },
	});

	response.headers.set('X-Req-Id', uuid);

	return response;
}
