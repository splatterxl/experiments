import { AppProperties } from '@/lib/analytics/web';
import { ErrorCodes, Errors } from '@/lib/errors';
import * as Sentry from '@sentry/nextjs';
import { detect } from 'detect-browser';
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
				'user-agent',
			]) {
				if (!request.headers.has(header) || !request.headers.get(header)) {
					return new NextResponse(
						JSON.stringify(Errors[ErrorCodes.FRAUD]('headers')),
						{
							status: 403,
							headers: { 'content-type': 'application/json' },
						}
					);
				}
			}

			if (!request.headers.get('user-agent')?.startsWith('Mozilla/5.0')) {
				return new NextResponse(
					JSON.stringify(Errors[ErrorCodes.FRAUD]('user_agent')),
					{
						status: 403,
						headers: { 'content-type': 'application/json' },
					}
				);
			}

			{
				const navigator = detect(request.headers.get('user-agent')!);

				switch (navigator && navigator.type) {
					case 'browser':
						break;
					default: {
						return new NextResponse(
							JSON.stringify(Errors[ErrorCodes.FRAUD]('fingerprint')),
							{
								status: 403,
								headers: { 'content-type': 'application/json' },
							}
						);
					}
				}
			}

			if (!request.nextUrl.pathname.startsWith('/api/~')) {
				try {
					if (!request.headers.has('x-app-props'))
						throw new Error('no app props');

					const appProps: AppProperties | null = request.headers.get(
						'x-app-props'
					)
						? JSON.parse(atob(request.headers.get('x-app-props')!))
						: null;

					const bail = (reason: string) =>
						new NextResponse(JSON.stringify(Errors[ErrorCodes.FRAUD](reason)), {
							status: 403,
							headers: { 'content-type': 'application/json' },
						});

					if (!appProps) return bail('app_props_present');

					for (const prop of [
						'browser_user_agent',
						'app_version',
						'app_environment',
					]) {
						if (!appProps?.[prop as keyof AppProperties]) {
							return bail('app_props_keys');
						}
					}

					if (
						appProps.app_environment !== process.env.NODE_ENV ||
						appProps.browser_user_agent !== request.headers.get('user-agent')
					) {
						return bail('app_props_env_ua');
					}
				} catch (err: any) {
					console.log(err);

					return new NextResponse(
						JSON.stringify(Errors[ErrorCodes.FRAUD]('app_props')),
						{
							status: 403,
							headers: { 'content-type': 'application/json' },
						}
					);
				}
			}
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
