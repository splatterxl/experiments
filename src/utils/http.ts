import { sleep } from '.';
import { APIEndpoints, makeURL } from './constants';

export const request = async (url: string, init?: RequestInit) => {
	async function get() {
		return await fetch(url, init);
	}

	let res = await get();

	while (res.status === 429) {
		const ms = parseInt(res.headers.get('x-ratelimit-reset')!) - Date.now();

		console.log(`sleeping ${ms}ms`);

		await sleep(ms);

		res = await get();
	}

	return res;
};

export const getGuilds = () =>
	request(makeURL(APIEndpoints.GUILDS)).then((res) => res.json());
