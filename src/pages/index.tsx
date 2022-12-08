import {
	Center,
	Heading,
	Highlight,
	Icon,
	List,
	ListItem,
	Text,
	useMediaQuery
} from '@chakra-ui/react';
import { css } from '@emotion/react';
import Head from 'next/head';
import { IoIosRocket } from 'react-icons/io';
import { PrimaryButton } from '../components/brand/PrimaryButton';
import { PremiumBadge } from '../components/premium/PremiumBadge';

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
					md: '10vh'
				}}
				flexDirection='column'
				gap={{ base: 2, md: 1 }}
			>
				<Heading
					size='3xl'
					display={{ base: 'block', md: 'none' }}
					fontWeight='black'
					css={css`
						background: linear-gradient(
							90deg,
							rgba(246, 173, 85, 1) 0%,
							#f99d51 100%
						);
						-webkit-text-fill-color: transparent;
						background-clip: text;
					`}
				>
					Experiments
				</Heading>
				<Heading size={{ base: 'lg', md: '3xl' }} paddingX={3} fontWeight={800}>
					<Highlight
						query='key'
						styles={{
							background: 'linear-gradient(90deg, #ec9c3a 0%, 	#e6893e 100%)',
							'-webkit-text-fill-color': 'transparent',
							'background-clip': 'text'
						}}
					>
						Your key to new features.
					</Highlight>
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
				<PrimaryButton
					mt={4}
					pr={5}
					size='lg'
					href='/get-started'
					label='Get Started'
					icon={<Icon as={IoIosRocket} />}
					iconPos='right'
				/>
			</Center>
		</>
	);
}
