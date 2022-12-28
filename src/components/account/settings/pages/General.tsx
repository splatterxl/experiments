import { Box, Heading, HStack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import React from 'react';
import CurrentUserStore from '../../../../stores/CurrentUserStore';
import { Routes } from '../../../../utils/constants';
import { UserIcon } from '../../UserIcon';

export const General: React.FC<{ storage: typeof localStorage }> = ({
	storage: localStorage,
}) => {
	const user = CurrentUserStore.useValue()!;

	if (!user) return <></>;

	return (
		<>
			<Heading pt={2}>
				<HStack align='center' spacing={4}>
					<UserIcon
						size='md'
						id={user.id}
						avatar={user.avatar}
						username={user.username}
						discrim={user.discriminator}
					/>
					<HStack pb={2} align='center' spacing={3}>
						<Box>
							<Text as='span'>{user.username}</Text>
							<Text as='span' fontSize='2xl' fontWeight={500}>
								#{user.discriminator}
							</Text>
						</Box>
						<Link href={Routes.LOGOUT} passHref legacyBehavior>
							<Text
								as='a'
								fontSize='md'
								fontWeight={200}
								pt={2}
								display={{ base: 'none', sm: 'inline-block' }}
							>
								Logout?
							</Text>
						</Link>
					</HStack>
				</HStack>
			</Heading>
		</>
	);
};
