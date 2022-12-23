import {
	Badge,
	Center,
	Checkbox,
	Heading,
	HStack,
	List,
	ListItem,
	Text,
	VStack
} from '@chakra-ui/react';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import Head from 'next/head';
import { PrimaryButton } from '../../../components/brand/PrimaryButton';
import { one } from '../../../utils';

export default function Login({ next }: { next: string }) {
	const scopes = {
		guilds: true,
		join: false
	};

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
						lg: '35vw'
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
					padding={8}
					rounded='lg'
					spacing={3}
				>
					<VStack alignItems='flex-start' spacing={0} width='full'>
						<Heading fontWeight={800}>Login</Heading>
						<Text>You can opt out of certain scopes.</Text>
					</VStack>
					<List fontSize='lg'>
						<ListItem>
							<Checkbox
								checked={true}
								isChecked={true}
								spacing={3}
								iconSize='lg'
								size='lg'
							>
								<HStack>
									<Text>Profile information & email address</Text>
									<Badge variant='solid' display={{ base: 'none', md: 'true' }}>
										Required
									</Badge>
								</HStack>
							</Checkbox>
						</ListItem>
						<ListItem>
							<Checkbox
								checked={true}
								isChecked={true}
								spacing={3}
								size='lg'
								onChange={(event) => {
									scopes.guilds = event.target.checked;
								}}
							>
								<HStack>
									<Text>View your server names and icons.</Text>
									<Badge variant='solid' display={{ base: 'none', md: 'true' }}>
										Required
									</Badge>
								</HStack>
							</Checkbox>
						</ListItem>
						<ListItem>
							<Checkbox
								checked={true}
								spacing={3}
								iconSize='lg'
								size='lg'
								onChange={(event) => {
									scopes.join = event.target.checked;
								}}
							>
								<HStack>
									<Text>Join our support server</Text>
								</HStack>
								<Badge variant='outline' display={{ base: 'none', md: 'true' }}>
									Recommended
								</Badge>
							</Checkbox>
						</ListItem>
					</List>
					<PrimaryButton
						marginTop={1}
						label='Login with Discord'
						href={
							{
								pathname: '/api/auth/login',
								query: {
									scopes: Buffer.from(JSON.stringify(scopes)).toString(
										'base64'
									),
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

	console.log(context.query);

	return {
		props: {
			next: one(context.query.next) ?? '/dashboard'
		}
	};
}
