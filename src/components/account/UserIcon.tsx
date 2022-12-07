import { Avatar, AvatarProps } from '@chakra-ui/react';
import type { Snowflake } from 'discord-api-types/globals';
import { userIcon } from '../../utils/constants/discord';

export const UserIcon: React.FC<
	{ username: string; avatar?: string | null; id: Snowflake } & AvatarProps
> = ({ username, avatar, id, ...props }) => {
	return (
		<Avatar
			name={username}
			src={avatar ? userIcon(id, avatar) : undefined}
			{...props}
		/>
	);
};
