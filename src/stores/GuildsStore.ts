import {
	RESTGetAPICurrentUserGuildsResult,
	Snowflake,
} from 'discord-api-types/v10';
import { APIEndpoints, makeURL } from '../utils/constants';
import { request } from '../utils/http';
import Store from './Store';

export default new (class CurrentUserGuildsStore extends Store<RESTGetAPICurrentUserGuildsResult> {
	constructor() {
		super([], 'guilds', true);
	}

	useIDValues() {
		const value = this.useValue();

		return value.map((v) => v.id);
	}

	async fetch(set: ReturnType<CurrentUserGuildsStore['useSetInStorage']>) {
		try {
			const { ok, json } = await request(makeURL(APIEndpoints.GUILDS)).then(
				async (res) => ({
					ok: res.ok,
					json: await res.json(),
				})
			);

			if (ok) set(json);
			else set([]);
		} catch (err) {
			console.error(err);
		}
	}

	useItem(k?: Snowflake | null) {
		const get = this.useGetFromStorage();

		if (!k) return;

		return get().find((v) => v.id === k);
	}
})();
