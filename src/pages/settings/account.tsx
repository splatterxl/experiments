import { PrimaryButton } from '@/components/brand/PrimaryButton';
import HTTPClient from '@/lib/http';
import { APIEndpoints } from '@/utils/constants';
import { Box, Heading, Text, useToast, VStack } from '@chakra-ui/react';
import Head from 'next/head';
import {
	SettingsPage,
	SettingsPages,
} from '../../components/account/settings/Settings';

export default function Dashboard() {
	const toast = useToast();

	return (
		<>
			<Head>
				<title>Settings | Experiments</title>
			</Head>
			<SettingsPage page={SettingsPages.ACCOUNT}>
				<VStack justify='flex-start' w='full' align='flex-start'>
					<Box>
						<Heading>GDPR Data Request</Heading>
						<Text>
							It may take up to 30 days to collect your data. We&apos;ll send
							you an email containing a link to download your collection as soon
							as it&apos;s ready.
						</Text>
						<PrimaryButton
							mt={2}
							label='Request My Data'
							onClick={async () => {
								const { err, ok } = await HTTPClient.post(
									APIEndpoints.HARVEST,
									{},
									{
										wait: false,
									}
								);

								toast({
									status: ok ? 'success' : 'error',
									// title: ok ? 'Collection started' : 'Error',
									description: err.message,
									position: 'bottom-right',
									isClosable: true,
								});
							}}
						/>
					</Box>
				</VStack>
			</SettingsPage>
		</>
	);
}
