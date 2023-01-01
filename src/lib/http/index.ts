import { getProperties } from '@/lib/analytics/web';
import logger from '@/lib/logger/web';
import { RESTGetAPICurrentUserGuildsResult } from 'discord-api-types/v10';
import { sleep } from '../../utils';
import { APIEndpoints, makeURL } from '../../utils/constants';

export const request = async (
	url: string,
	init?: RequestInit & { wait?: boolean }
) => {
	async function get() {
		return await fetch(url, {
			...(init ?? {}),
			headers: {
				...(init?.headers ?? {}),
				'X-App-Props': Buffer.from(JSON.stringify(getProperties())).toString(
					'base64'
				),
			},
		});
	}

	let res = await get();

	while (res.status === 429 && (init?.wait ?? true)) {
		const ms = parseInt(res.headers.get('retry-after')!) * 1000;

		logger.debug(
			{
				url,
			},
			`sleeping ${ms}ms`
		);

		await sleep(ms);

		res = await get();
	}

	return res;
};

export const getGuilds = () =>
	HTTPClient.get<RESTGetAPICurrentUserGuildsResult>(APIEndpoints.GUILDS).then(
		(res) => res.data
	);

export interface RequestOptions extends RequestInit {
	wait?: boolean;
}

export interface ResponseData<T> extends Response {
	data: T;
	err: Error;
}

const HTTPClient = new (class HTTPClient {
	constructor(public fetch = request) {}

	async request<T = unknown>(
		endpoint: string,
		options: RequestOptions = {}
	): Promise<ResponseData<T>> {
		const res = (await this.fetch(
			makeURL(endpoint),
			options
		)) as any as ResponseData<T>;

		if (res.status === 429) {
			logger.warn('http', 'You are being rate limited');
		}

		let text = await res.text();

		try {
			res.data = JSON.parse(text);
		} catch (e) {
			// @ts-ignore
			res.data = text || null;

			if (res.status !== 204)
				logger.debug(
					'http',
					'could not parse json for request with non-204 status',
					endpoint,
					res.status,
					res.data
				);
		}

		res.json = async () => res.data;

		if (!res.ok) {
			res.err = res.data as any;
		}

		return res;
	}

	get<T>(endpoint: string, options: RequestOptions = {}) {
		return this.request<T>(endpoint, {
			...options,
			method: 'GET',
		});
	}

	post<T>(endpoint: string, body: any, options: RequestOptions = {}) {
		return this.request<T>(endpoint, {
			...options,
			method: 'POST',
			body: JSON.stringify(body),
			headers: {
				...(options.headers ?? {}),
				'Content-Type': 'application/json',
			},
		});
	}

	put<T>(endpoint: string, body: any, options: RequestOptions = {}) {
		return this.request<T>(endpoint, {
			...options,
			method: 'PUT',
			body: JSON.stringify(body),
			headers: {
				...(options.headers ?? {}),
				'Content-Type': 'application/json',
			},
		});
	}

	delete<T = never>(endpoint: string, options: RequestOptions = {}) {
		return this.request<T>(endpoint, {
			...options,
			method: 'DELETE',
		});
	}

	patch<T>(endpoint: string, body: any, options: RequestOptions = {}) {
		return this.request<T>(endpoint, {
			...options,
			method: 'PATCH',
			body: JSON.stringify(body),
			headers: {
				...(options.headers ?? {}),
				'Content-Type': 'application/json',
			},
		});
	}
})();

export default HTTPClient;
