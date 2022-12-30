import { APIUser } from 'discord-api-types/v10';
import { decode } from 'jsonwebtoken';
import { parseCookies } from 'nookies';
import React from 'react';
import CurrentUserStore from '../stores/CurrentUserStore';
import GuildsStore from '../stores/GuildsStore';
import { one } from '../utils';

export const PersistedStateProvider: React.FC<React.PropsWithChildren<{}>> = ({
	children,
}) => {
	const setGuilds = GuildsStore.useSetInStorage();
	const setUser = CurrentUserStore.useSetInStorage();

	const cookies = parseCookies();

	React.useEffect(() => {
		GuildsStore.fetch(setGuilds);

		if (cookies.auth) setUser(decode(one(cookies.auth)) as APIUser);
		else setUser(null as any);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return <>{children}</>;
};
