import { Center, Flex } from '@chakra-ui/react';
import Head from 'next/head';
import { PrimaryButton } from '../components/brand/PrimaryButton';

export default function Premium() {
	return (
		<>
			<Head>
				<title>Dashboard | Experiments</title>
			</Head>
			<Center h='85vh' pb='10vh' flexDirection='column' textAlign='center'>
				<Flex maxW='60vw' maxH='80vh'>
					<PrimaryButton label='Go to settings' href='/settings' />
				</Flex>
			</Center>
		</>
	);
}
