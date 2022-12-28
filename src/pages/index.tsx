import {
	Center,
	Heading,
	Highlight,
	Icon,
	List,
	ListItem,
	Tag,
	Text,
	useMediaQuery,
} from '@chakra-ui/react';
import Head from 'next/head';
import Link from 'next/link';
import { PrimaryButton } from '../components/brand/PrimaryButton';
import { RocketIcon } from '../components/brand/RocketIcon';
import { PremiumBadge } from '../components/premium/PremiumBadge';
import { createAnalyticsQuery } from '../utils/analytics';
import { Routes } from '../utils/constants';

export default function Home() {
	return (
		<>
			<Head>
				<title>Experiments</title>
			</Head>
			<Center
				pt={useMediaQuery('(max-height: 500px)')[0] ? 30 : 36}
				pb={{
					base: '30vh',
					md: '10vh',
				}}
				flexDirection='column'
				gap={{ base: 1, md: 1 }}
			>
				<Link
					href={createAnalyticsQuery({
						path: Routes.UPDATES,
						analytics: {
							from: 'home-mailing-list-cta',
							campaign: 'mailing-list',
						},
					})}
				>
					{/* // TODO */}
					<Tag rounded='lg' display='none'>
						<b>NEW</b>: Get monthly email updates for only $1
					</Tag>
				</Link>
				<Heading
					size={{ base: '2xl', md: '2xl', lg: '3xl' }}
					lineHeight={0}
					paddingX={3}
					fontWeight={800}
					textAlign='center'
				>
					<Highlight
						query='key'
						styles={{
							background: 'linear-gradient(90deg, #ec9c3a 0%, 	#e6893e 100%)',
							WebkitTextFillColor: 'transparent',
							backgroundClip: 'text',
						}}
					>
						Your key to new features.
					</Highlight>
				</Heading>
				<Text
					fontSize={{ base: 'xl', md: '2xl' }}
					textAlign='center'
					paddingX={{ base: 24, md: 16, lg: 72 }}
				>
					Experiments makes it easier to find out when your server gets access
					to new features, giving your community more time to focus on itself.
				</Text>
				<List
					mt={3}
					fontSize={{ base: 'xl', md: 'xl' }}
					listStyleType='initial'
					textAlign={'center'}
					listStylePosition='inside'
					display={{ base: 'none', md: 'block' }}
				>
					<ListItem>Access both online and in Discord</ListItem>
					<ListItem>Personalised email digests every week</ListItem>
					<ListItem>
						Get customised alerts{' '}
						<PremiumBadge display={{ base: 'none', md: 'inline-block' }} />
					</ListItem>
					<ListItem>
						Intelligently track feature availability{' '}
						<PremiumBadge display={{ base: 'none', md: 'inline-block' }} />
					</ListItem>
				</List>
				<PrimaryButton
					mt={4}
					pr={5}
					size='lg'
					href={createAnalyticsQuery({
						path: Routes.GET_STARTED,
						analytics: { from: 'home-main-cta' },
					})}
					label='Get Started'
					icon={<Icon as={RocketIcon} />}
					iconPos='right'
				/>
			</Center>
		</>
	);
}
