import { UserIcon } from '@/components/account/UserIcon';
import { checkAuthProps } from '@/lib/auth/request';
import CurrentUserStore from '@/stores/CurrentUserStore';
import { Routes } from '@/utils/constants';
import { Box, Heading, HStack, Link, Text } from '@chakra-ui/react';
import { APIUser } from 'discord-api-types/v10';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import Head from 'next/head';
import React from 'react';
import {
	SettingsPage,
	SettingsPages,
} from '../../components/account/settings/Settings';

interface SettingsProps {
	user: APIUser;
}

export default function Settings({ user: userProp }: SettingsProps) {
	const [user, setState] = React.useState(userProp);
	const [getUser, setUser] = CurrentUserStore.useStateFromStorage();

	React.useEffect(() => {
		if (userProp) setUser(userProp);
		else setState(getUser());
	}, []);

	if (!user) return null;

	return (
		<>
			<Head>
				<title>Settings | Experiments</title>
			</Head>
			<SettingsPage page={SettingsPages.GENERAL}>
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
							<Link
								fontSize='md'
								fontWeight={200}
								pt={2}
								display={{ base: 'none', sm: 'inline-block' }}
								href={Routes.LOGOUT}
							>
								Logout?
							</Link>
						</HStack>
					</HStack>
				</Heading>
			</SettingsPage>
		</>
	);
}

export async function getServerSideProps(
	context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<SettingsProps>> {
	const auth = await checkAuthProps(context);

	if (!auth)
		return {
			redirect: {
				destination: Routes.LOGIN_TO(Routes.SETTINGS),
				permanent: false,
			},
		};

	return { props: { user: auth[0] } };
}
