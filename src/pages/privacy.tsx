import { Heading, List, ListItem, Text, VStack } from '@chakra-ui/react';
import Head from 'next/head';
import { Link } from '../components/Link';

export default function Privacy() {
	return (
		<>
			<Head>
				<title>Privacy | Experiments</title>
			</Head>
			<VStack px={16} pt={10} pb={8} align='flex-start'>
				<Heading size='3xl' pb={1} fontWeight='black'>
					Privacy Policy
				</Heading>
				<Text fontWeight={300}>
					Last modified and effective: December 23, 2022.
				</Text>
				<Heading fontWeight='extrabold'>Overview</Heading>
				<Text>
					Experiments is a service and website dashboard for tracking new
					features (&quot;<b>experiments</b>&quot;) on the popular voice and
					messaging platform Discord. In this document we will outline the data
					collected, linked and shared by us and our partners to facilitate our
					services.
				</Text>
				<Heading>01. Data Collected</Heading>
				<Text>
					We and our partners collect some personally identifiable information
					to faciliate our services and payment systems.
				</Text>
				<List styleType='initial' px={6}>
					<ListItem>
						We collect and store your numeric user and server identifiers
						provided by Discord to identify you on our services and to link
						subscriptions to specific servers.
					</ListItem>
					<ListItem>
						We collect your email address to contact you about important changes
						to your account and subscription, and to provide our{' '}
						<Link href='/premium'>Mailing List</Link> services. We will never
						send you promotional content without prior and active consent.
					</ListItem>
					<ListItem>
						If you use our online dashboard or Discord bot to view experiment
						rollout data, we collect information about your server(s) including
						their numeric identifier, member count, and other miscellaneous data
						to compute said data.
					</ListItem>
					<ListItem>
						If you choose to purchase a subscription to our services through our
						payment gateway <Link href='https://stripe.com'>Stripe</Link>, they
						may collect and store your personal data as detailed in their{' '}
						<Link href='https://stripe.com/privacy'>Privacy Policy.</Link>
					</ListItem>
				</List>
				<Heading>02. Request Your Data</Heading>
				<Text>
					You may request a copy of your data through the online dashboard by
					navigating to your{' '}
					<Link href='/settings/account'>Account Settings</Link> and clicking on
					the button labelled &quot;Request My Data&quot;. It may take up to 30
					days for us to process your request.
				</Text>
				<Heading>03. Delete Your Data</Heading>
				<Text>
					You may remove our records of your data and billing subscription
					history by deleting your account through{' '}
					<Link href='/settings/account'>Account Settings</Link>. Unfortunately
					due to technical limitations beyond our control we are unable to
					delete your data after you disconnect our OAuth2 Application through
					your Discord settings.
				</Text>
				<Heading>04. Further Information</Heading>
				<Text>
					If you have any questions or wish to contact us about your
					information, please do not hesitate to contact us at{' '}
					<Link href='mailto:splatterxl@duck.com'>splatterxl@duck.com</Link>.
				</Text>
			</VStack>
		</>
	);
}
