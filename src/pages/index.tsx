import {
	Center,
	Heading,
	List,
	ListItem,
	Text,
	useMediaQuery
} from '@chakra-ui/react';
import Head from 'next/head';
import { PremiumBadge } from '../components/premium/PremiumBadge';

export default function Home() {
	return (
		<>
			<Head>
				<title>Experiments</title>
			</Head>
			<Center
				pt={useMediaQuery('(max-height: 500px)')[0] ? 30 : 40}
				pb={{
					base: '30vh',
					md: '10vh'
				}}
				flexDirection='column'
				gap={{ base: 2, md: 1 }}
			>
				<Heading
					size='3xl'
					display={{ base: 'block', md: 'none' }}
					fontWeight={'black'}
				>
					Experiments
				</Heading>
				<Heading size={{ base: 'lg', md: '3xl' }} paddingX={3} fontWeight={800}>
					Your key to new features.
				</Heading>
				<Text
					fontSize={{ base: 'xl', md: '2xl' }}
					maxW={{ base: '100%', md: '60vw' }}
					textAlign='center'
					paddingX={6}
				>
					Experiments makes it easier to find out when your server gets access
					to new features, giving your community more time to focus on itself.
				</Text>
				<List
					mt={3}
					fontSize={{ base: 'md', md: 'xl' }}
					listStyleType='initial'
					textAlign={'center'}
					listStylePosition='inside'
					// display={{ base: 'none', md: 'block' }}
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
			</Center>
		</>
	);
}
