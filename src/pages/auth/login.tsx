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
import { PrimaryButton } from '../../components/brand/PrimaryButton';

export default function Login() {
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
					_light={{ base: {}, md: { bgColor: 'orange.50' } }}
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
								defaultChecked={true}
								iconSize='lg'
								spacing={3}
								size='lg'
								onChange={(event) => {
									scopes.guilds = event.target.checked;
								}}
							>
								<HStack>
									<Text>List your guilds in the dashboard</Text>
									<Badge
										variant='outline'
										display={{ base: 'none', md: 'true' }}
									>
										Recommended
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
									scopes: Buffer.from(JSON.stringify(scopes)).toString('base64')
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
): Promise<GetServerSidePropsResult<{}>> {
	if (context.req.cookies['auth']) {
		return {
			redirect: {
				destination: '/dashboard',
				statusCode: 302 /* Found */
			}
		};
	}

	return {
		props: {}
	};
}
