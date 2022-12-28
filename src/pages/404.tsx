import { ArrowBackIcon } from '@chakra-ui/icons';
import { Center, Heading, Text } from '@chakra-ui/react';
import Head from 'next/head';
import { GhostButton } from '../components/brand/GhostButton';
import { Routes } from '../utils/constants';

export default function NotFound() {
	return (
		<>
			<Head>
				<title>Not Found | Experiments</title>
			</Head>
			<Center h='85vh' pb='20vh' flexDirection='column' textAlign='center'>
				<Heading>Not Found</Heading>
				<Text fontSize='lg' maxW='50vw' textAlign='center'>
					The page you&apos;re looking for moved or does not exist.
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
