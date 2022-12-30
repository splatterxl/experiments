import { APIEndpoints, makeURL } from '@/utils/constants';
import { APP_ID, Endpoints, makeDiscordURL } from '@/utils/constants/discord';

export function getDiscordAuthURL(scope: string[], next: string) {
	return makeDiscordURL(Endpoints.OAUTH2_AUTH, {
		client_id: APP_ID,
		scope: scope.join(' '),
		redirect_uri: origin + makeURL(APIEndpoints.DISCORD_CALLBACK),
		response_type: 'code',
		state: Buffer.from(JSON.stringify({ next })).toString('base64'),
		prompt: 'none',
	});
}
