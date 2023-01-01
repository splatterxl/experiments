import { ArrowBackIcon } from '@chakra-ui/icons';
import { Center, Heading, Text } from '@chakra-ui/react';
import Head from 'next/head';
import { GhostButton } from '../components/brand/GhostButton';
import { Routes } from '../utils/constants';

export default function NotFound() {
	return (
		<>
			<Head>
				<title>Internal Server Error | Experiments</title>
			</Head>
			<Center h='85vh' pb='20vh' flexDirection='column' textAlign='center'>
				<Heading>Unexpected Error</Heading>
				<Text fontSize='lg' maxW='50vw' textAlign='center'>
					The page you&apos;re looking for caused an unhandled exception in our
					systems. We have been notified of the issue and are working on a fix.
				</Text>
				<GhostButton
					label='Go Home'
					icon={<ArrowBackIcon />}
					mt={3}
					href={Routes.HOME}
				/>
			</Center>
		</>
	);
}
