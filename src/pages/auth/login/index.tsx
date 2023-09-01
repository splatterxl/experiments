import { PrimaryButton } from '@/components/brand/PrimaryButton';
import { Link } from '@/components/Link';
import { getOrigin } from '@/lib/util';
import { one } from '@/utils';
import { APP_ID, Endpoints, makeDiscordURL } from '@/utils/constants/discord';
import {
	Badge,
	Center,
	Checkbox,
	Heading,
	HStack,
	Text,
	VStack,
} from '@chakra-ui/react';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import Head from 'next/head';
import React from 'react';
import { APIEndpoints, makeURL, Routes } from '../../../utils/constants';

function getDiscordAuthURL(scope: string[], next: string, origin: string) {
	return makeDiscordURL(Endpoints.OAUTH2_AUTH, {
		client_id: APP_ID,
		scope: scope.join(' '),
		redirect_uri: origin + makeURL(APIEndpoints.DISCORD_CALLBACK),
		response_type: 'code',
		state: Buffer.from(JSON.stringify({ next })).toString('base64'),
		prompt: 'none',
	});
}

interface LoginProps {
	next: string;
	origin: string;
}

export default function Login({ next, origin }: LoginProps) {
	let [join, setJoin] = React.useState(false);

	return (
		<>
			<Head>
				<title>Login | Experiments</title>
			</Head>
			<Center
				h='80vh'
				pb='10vh'
				flexDirection='column'
				justifyContent={{ base: 'flex-start', md: 'center' }}
			>
				<VStack
					maxW={{
						base: '100vw',
						sm: '60vw',
						lg: '30vw',
					}}
					align='flex-start'
					justify='flex-start'
					_dark={{ base: {}, md: { bgColor: 'gray.700' } }}
					_light={{
						base: {},
						md: {
							bgColor: 'orange.50',
							boxShadow: 'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;',
						},
					}}
					padding={{ base: 10, sm: 8 }}
					rounded='lg'
					spacing={3}
				>
					<VStack alignItems='flex-start' spacing={0} width='full'>
						<Heading fontWeight={800}>Login</Heading>
						<Text>
							By logging in, you agree to our{' '}
							<Link href={Routes.TERMS}>Terms of Service</Link> and{' '}
							<Link href={Routes.PRIVACY}>Privacy Policy.</Link>
						</Text>
					</VStack>
					<Checkbox
						checked={join}
						spacing={3}
						iconSize='lg'
						size='lg'
						onChange={(event) => {
							setJoin(event.target.checked);
						}}
					>
						<HStack>
							<Text>Join our support server</Text>
						</HStack>
						<Badge variant='outline' display={{ base: 'none', md: 'true' }}>
							Recommended
						</Badge>
					</Checkbox>
					<PrimaryButton
						marginTop={1}
						label='Login with Discord'
						href={getDiscordAuthURL(
							['email', 'identify', 'guilds'].concat(
								join ? ['guilds.join'] : []
							),
							next,
							origin
						)}
					/>
				</VStack>
			</Center>
		</>
	);
}

export const runtime = 'edge';

export async function getServerSideProps(
	context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<LoginProps>> {
	if (context.req.cookies['auth']) {
		return {
			redirect: {
				destination: Routes.LOGIN_ONBOARDING(
					context.query.next
						? encodeURIComponent(one(context.query.next))
						: undefined
				),
				statusCode: 302 /* Found */,
			},
		};
	}

	return {
		props: {
			next: one(context.query.next) ?? Routes.DASHBOARD,
			origin: getOrigin(context.req),
		},
	};
}
