export const Endpoints = {
	OAUTH2_AUTH: '/oauth2/authorize',
	EXCHANGE: '/oauth2/token',
	ACCEPT_INVITE: (invite: string) => `/invites/${invite}`
};

export const Domains = {
	API:
		process.env.NODE_ENV === 'development'
			? 'canary.discord.com'
			: 'discord.com'
};

export function makeDiscordURL(endpoint: string, query: any) {
	return `https://${Domains.API}/api/v10${endpoint}?${new URLSearchParams(
		query ?? {}
	).toString()}`;
}

export const APP_ID = '957383358592217088';
export const GUILD_ID = '1050119994681335818';
export const GUILD_INVITE = 'qXr24sqcCF';
