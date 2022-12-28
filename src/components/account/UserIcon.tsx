import { Avatar, AvatarProps } from '@chakra-ui/react';
import type { Snowflake } from 'discord-api-types/globals';
import React from 'react';
import { userIcon } from '../../utils/constants/discord';

export const UserIcon: React.FC<
	{
		username: string;
		avatar?: string | null;
		id: Snowflake;
		discrim: string;
	} & AvatarProps
> = ({ username, avatar, id, discrim, ...props }) => {
	const [loaded, setLoaded] = React.useState(false);

	React.useEffect(() => {
		setLoaded(true);
	}, []);

	if (!loaded) return null;

	return (
		<Avatar
			name={username}
			src={userIcon(id, avatar!, parseInt(discrim))}
			{...props}
		/>
	);
};
