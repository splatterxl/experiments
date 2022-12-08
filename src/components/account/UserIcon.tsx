import { Avatar, AvatarProps } from '@chakra-ui/react';
import type { Snowflake } from 'discord-api-types/globals';
import { userIcon } from '../../utils/constants/discord';

export const UserIcon: React.FC<
	{
		username: string;
		avatar?: string | null;
		id: Snowflake;
		discrim: string;
	} & AvatarProps
> = ({ username, avatar, id, discrim, ...props }) => {
	return (
		<Avatar
			name={username}
			src={userIcon(id, avatar!, parseInt(discrim))}
			{...props}
		/>
	);
};
