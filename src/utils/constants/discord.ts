import type { Snowflake } from 'discord-api-types/globals';

export const Endpoints = {
	OAUTH2_AUTH: '/oauth2/authorize',
	EXCHANGE: '/oauth2/token',
	REVOKE_TOKEN: '/oauth2/token/revoke',
	ACCEPT_INVITE: (invite: string) => `/invites/${invite}`,
	ME: '/users/@me'
};

export const Domains = {
	API:
		process.env.NODE_ENV === 'development'
			? 'canary.discord.com'
			: 'discord.com',
	CDN: 'cdn.discordapp.com'
};

export function makeDiscordURL(endpoint: string, query: any) {
	return `https://${Domains.API}/api/v10${endpoint}?${new URLSearchParams(
		query ?? {}
	).toString()}`;
}

export function userIcon(id: Snowflake, avatar: string) {
	return `https://${Domains.CDN}/avatars/${id}/${avatar}.png?size=1024`;
}

export const APP_ID = '957383358592217088';
export const GUILD_ID = '1050119994681335818';
export const GUILD_INVITE = 'qXr24sqcCF';
