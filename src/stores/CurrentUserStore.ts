import { APIUser } from 'discord-api-types/v10';
import { APIEndpoints, makeURL } from '../utils/constants';
import { request } from '../utils/http';
import Store from './Store';

export default new (class CurrentUserStore extends Store<APIUser> {
	constructor() {
		super(null as any, 'user', true);
	}

	async fetch(set: ReturnType<CurrentUserStore['useSetInStorage']>) {
		const { ok, json } = await request(makeURL(APIEndpoints.ME, {})).then(
			async (res) => ({
				ok: res.ok,
				json: await res.json(),
			})
		);

		if (ok) set(json);
		else set(null as any);
	}
})();
