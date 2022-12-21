import { Heading, List, ListItem, Text, VStack } from '@chakra-ui/react';
import Head from 'next/head';
import Link from 'next/link';

export default function Privacy() {
	return (
		<>
			<Head>
				<title>Privacy | Experiments</title>
			</Head>
			<VStack px={7} pb={8} align='flex-start'>
				<Heading size='3xl' pb={1} fontWeight='black'>
					Privacy Policy
				</Heading>
				<Text fontWeight={300}>
					Last modified and effective: December 19, 2022.
				</Text>
				<Heading fontWeight='extrabold'>Overview</Heading>
				<Text>
					Experiments is a service and website dashboard for tracking new
					features on the popular voice and messaging platform Discord. In this
					document we will outline the data collected, linked and shared by us
					and our partners to facilitate our services.
				</Text>
				<Heading>01. Data Collected</Heading>
				<Text>
					We and our partners collect some personally identifiable information
					to faciliate our services and payment systems.
				</Text>
				<List styleType='initial' px={6}>
					<ListItem>
						To faciliate our subscription service linking to Discord, we collect
						and link email addresses used for purchases through our payment
						gateway <Link href='https://stripe.com'>Stripe</Link>. This works
						very simply: when a payment is made through Stripe, we permanently
						link the email address used by your Discord account at that time to
						that subscription and your unique numeric identifier provided by
						Discord in our encrypted database hosted by{' '}
						<Link href='https://mongodb.com/atlas'>MongoDB Atlas</Link>.
					</ListItem>
				</List>
				<Heading>02. Request Your Data</Heading>
				<Text>
					You may request a copy of your data through the online dashboard by
					navigating to your{' '}
					<Link href='/settings/account'>Account Settings</Link> and clicking on
					the big red button labelled &quot;Request My Data&quot;. It may take
					up to 30 days for us to process your request.
				</Text>
				<Heading>03. Delete Your Data</Heading>
				<Text>
					You may delete our records of your data and billing subscription
					history by deleting your account through{' '}
					<Link href='/settings/account'>Account Settings</Link>.
				</Text>
			</VStack>
		</>
	);
}