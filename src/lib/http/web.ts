import { sleep } from '../../utils';
import { APIEndpoints, makeURL } from '../../utils/constants';

export const request = async (url: string, init?: RequestInit) => {
	async function get() {
		return await fetch(url, init);
	}

	let res = await get();

	while (res.status === 429) {
		const ms = parseInt(res.headers.get('retry-after')!) * 1000;

		console.log(`sleeping ${ms}ms`);

		await sleep(ms);

		res = await get();
	}

	return res;
};

export const getGuilds = () =>
	request(makeURL(APIEndpoints.GUILDS)).then((res) => res.json());
