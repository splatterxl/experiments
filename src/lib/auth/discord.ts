import { authorizations } from '@/lib/db/collections';
import { Authorization } from '@/lib/db/models';
import {
	APP_ID,
	Endpoints,
	GUILD_INVITE,
	makeDiscordURL,
} from '@/utils/constants/discord';
import { Snowflake } from 'discord-api-types/globals';
import { RESTPostOAuth2AccessTokenResult } from 'discord-api-types/v10';

export async function revokeTokens(auth: Authorization, userId: Snowflake) {
	await fetch(makeDiscordURL(Endpoints.REVOKE_TOKEN, {}), {
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		method: 'POST',
		body: new URLSearchParams({
			token: auth.access_token,
			token_type_hint: 'access_token',
		}).toString(),
	});
	if (auth.refresh_token)
		await fetch(makeDiscordURL(Endpoints.REVOKE_TOKEN, {}), {
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			method: 'POST',
			body: new URLSearchParams({
				token: auth.refresh_token,
				token_type_hint: 'refresh_token',
			}).toString(),
		});

	await authorizations().deleteMany({ user_id: userId });
}

export async function getAccessToken(code: string, redirectURL: string) {
	const json: RESTPostOAuth2AccessTokenResult = await fetch(
		makeDiscordURL(Endpoints.EXCHANGE, {}),
		{
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({
				client_id: APP_ID,
				client_secret: process.env.DISCORD_CLIENT_SECRET!,
				grant_type: 'authorization_code',
				code: code,
				redirect_uri: redirectURL,
			}).toString(),
			method: 'POST',
		}
	).then((res) => res.json());

	if (!json.access_token) throw new Error(JSON.stringify(json));

	return json;
}

export async function refreshToken(refresh_token: string) {
	const json: RESTPostOAuth2AccessTokenResult = await fetch(
		makeDiscordURL(Endpoints.EXCHANGE, {}),
		{
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({
				client_id: APP_ID,
				client_secret: process.env.DISCORD_CLIENT_SECRET!,
				grant_type: 'authorization_code',
				refresh_token,
			}).toString(),
			method: 'POST',
		}
	).then((res) => res.json());

	if (!json.access_token) throw new Error(JSON.stringify(json));

	return json;
}

export async function joinSupportServer(auth: RESTPostOAuth2AccessTokenResult) {
	return fetch(makeDiscordURL(Endpoints.ACCEPT_INVITE(GUILD_INVITE), {}), {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `${auth.token_type} ${auth.access_token}`,
		},
		body: JSON.stringify({}),
	});
}

export async function handleAuthorization(
	result: RESTPostOAuth2AccessTokenResult,
	userId: Snowflake
) {
	const coll = authorizations();

	await coll.updateOne(
		{ user_id: userId },
		{
			$set: {
				access_token: result.access_token,
				refresh_token: result.refresh_token,
				expires: new Date(Date.now() + result.expires_in * 1000),
				token_type: result.token_type,
				scope: result.scope.split(''),
				user_id: userId,
			},
		},
		{
			upsert: true,
		}
	);
}
