import HTTPClient from '@/lib/http';
import {
	RESTGetAPICurrentUserGuildsResult,
	Snowflake,
} from 'discord-api-types/v10';
import { APIEndpoints } from '../utils/constants';
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
			const { ok, data } =
				await HTTPClient.get<RESTGetAPICurrentUserGuildsResult>(
					APIEndpoints.GUILDS
				);

			if (ok) set(data);
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

	useGetItem(k?: Snowflake | null) {
		const get = this.useGetFromStorage();

		if (!k) return () => undefined;

		return () => get().find((v) => v.id === k);
	}
})();
