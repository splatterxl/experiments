import { Heading, Text, VStack } from '@chakra-ui/react';
import Head from 'next/head';
import { UnderlinedLink } from '../components/Link';

export default function Privacy() {
	return (
		<>
			<Head>
				<title>Security | Experiments</title>
			</Head>
			<VStack px={16} pt={10} pb={24} align='flex-start' spacing={2}>
				<Heading size='3xl' pb={1} fontWeight='black'>
					Security Policy
				</Heading>
				<Text fontWeight={300}>
					Last modified and effective: December 29, 2022.
				</Text>
				<Text>
					As far as possible, we aim for Experiments to be a secure platform and
					to protect the data of its customers and users. That said, no software
					is perfect, and we ask that the online security community please
					submit any issues they may find privately and securely to us via email
					at{' '}
					<UnderlinedLink href='mailto:splatterxl@duck.com'>
						splatterxl@duck.com
					</UnderlinedLink>
					. If use of OpenPGP is required, you can use our{' '}
					<UnderlinedLink href='https://splt.dev/gpg-key.txt'>
						GPG public key
					</UnderlinedLink>
					.
				</Text>
			</VStack>
		</>
	);
}
