import { ArrowBackIcon } from '@chakra-ui/icons';
import { Center, Heading, Text } from '@chakra-ui/react';
import Head from 'next/head';
import { GhostButton } from '../components/brand/GhostButton';

export default function ComingSoon() {
	return (
		<>
			<Head>
				<title>Coming Soon | Experiments</title>
			</Head>
			<Center h='85vh' pb='20vh' flexDirection='column' textAlign='center'>
				<Heading>Under Construction</Heading>
				<Text fontSize='lg' maxW='50vw' textAlign='center'>
					This page is still under construction. We&apos;re cooking up something
					good!
				</Text>
				<GhostButton label='Go Home' icon={<ArrowBackIcon />} mt={3} href='/' />
			</Center>
		</>
	);
}
