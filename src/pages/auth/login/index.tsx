import {
	Badge,
	Center,
	Checkbox,
	Heading,
	HStack,
	Text,
	VStack
} from '@chakra-ui/react';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import Head from 'next/head';
import React from 'react';
import { PrimaryButton } from '../../../components/brand/PrimaryButton';
import { Link } from '../../../components/Link';
import { one } from '../../../utils';
import { APIEndpoints, makeURL } from '../../../utils/constants';

export default function Login({ next }: { next: string }) {
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
						lg: '30vw'
					}}
					align='flex-start'
					justify='flex-start'
					_dark={{ base: {}, md: { bgColor: 'gray.700' } }}
					_light={{
						base: {},
						md: {
							bgColor: 'orange.50',
							boxShadow: 'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;'
						}
					}}
					padding={{ base: 10, sm: 8 }}
					rounded='lg'
					spacing={3}
				>
					<VStack alignItems='flex-start' spacing={0} width='full'>
						<Heading fontWeight={800}>Login</Heading>
						<Text>
							By logging in, you agree to our{' '}
							<Link href='/terms'>Terms of Service</Link> and{' '}
							<Link href='/privacy'>Privacy Policy.</Link>
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
						href={
							{
								pathname: makeURL(APIEndpoints.LOGIN),
								query: {
									join,
									next
								}
							} as any
						}
					/>
				</VStack>
			</Center>
		</>
	);
}

export async function getServerSideProps(
	context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<{ next: string }>> {
	if (context.req.cookies['auth']) {
		return {
			redirect: {
				destination: `/auth/login/onboarding${
					context.query.next
						? `?next=${encodeURIComponent(one(context.query.next))}`
						: ''
				}`,
				statusCode: 302 /* Found */
			}
		};
	}

	return {
		props: {
			next: one(context.query.next) ?? '/dashboard'
		}
	};
}
