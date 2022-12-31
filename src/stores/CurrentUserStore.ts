import HTTPClient from '@/lib/http';
import { APIUser } from 'discord-api-types/v10';
import { APIEndpoints } from '../utils/constants';
import Store from './Store';

export default new (class CurrentUserStore extends Store<APIUser> {
	constructor() {
		super(null as any, 'user', true);
	}

	async fetch(set: ReturnType<CurrentUserStore['useSetInStorage']>) {
		const { ok, data } = await HTTPClient.get<APIUser>(APIEndpoints.ME);

		if (ok) set(data);
		else set(null as any);
	}
})();
