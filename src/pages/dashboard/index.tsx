import { Center, Flex } from '@chakra-ui/react';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import Head from 'next/head';
import { PrimaryButton } from '../../components/brand/PrimaryButton';
import { Routes } from '../../utils/constants';

export default function Premium() {
	return (
		<>
			<Head>
				<title>Dashboard | Experiments</title>
			</Head>
			<Center h='85vh' pb='10vh' flexDirection='column' textAlign='center'>
				<Flex maxW='60vw' maxH='80vh'>
					<PrimaryButton label='Go to settings' href={Routes.SETTINGS} />
				</Flex>
			</Center>
		</>
	);
}

export async function getServerSideProps({
	req,
}: GetServerSidePropsContext): Promise<GetServerSidePropsResult<{}>> {
	switch (true) {
		case req.cookies.auth == undefined || !req.cookies.auth:
			return { redirect: { destination: Routes.LOGIN, permanent: false } };
		default:
			return { props: {} };
	}
}
