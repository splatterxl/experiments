import { authorizations } from '@/lib/db/collections';
import { Authorization } from '@/lib/db/models';
import { sleep } from '@/utils';
import { Endpoints, makeDiscordURL } from '@/utils/constants/discord';
import { Snowflake } from 'discord-api-types/globals';
import { APIGuild } from 'discord-api-types/v10';

export function getAuthorization(userId: Snowflake) {
	const coll = authorizations();

	return coll.findOne({ user_id: userId });
}

export async function getAccessToken(userId: Snowflake, scope?: string) {
	const item = await authorizations().findOne({ user_id: userId, scope });

	if (item) return `${item.token_type} ${item.access_token}`;
	else return null;
}

export async function getUserProfile(
	userId: Snowflake,
	access?: Authorization
) {
	const auth = access
		? `${access.token_type} ${access.access_token}`
		: await getAccessToken(userId, 'identify');

	if (!auth) return null;

	const res = await fetch(makeDiscordURL(Endpoints.ME, {}), {
		headers: { Authorization: auth },
	});

	if (res.status !== 200) {
		return null;
	}

	return res.json();
}

export const getGuilds = async (
	access_token: string
): Promise<APIGuild[] | undefined> => {
	function get() {
		return fetch(makeDiscordURL(Endpoints.GUILDS, {}), {
			headers: { Authorization: `Bearer ${access_token}` },
		});
	}

	let res = await get();

	let i = 0;

	while (res.status === 429 && i < 2) {
		await sleep(
			parseInt(res.headers.get('x-ratelimit-reset')!) * 1000 - Date.now()
		);

		res = await get();

		i++;
	}

	if (res.status === 429) return undefined;

	const json = await res.json();

	if (!res.ok) console.error(json);
	else return json;
};
