import { sleep } from '.';

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
	request('/api/user/guilds').then((res) => res.json());
