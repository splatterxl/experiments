import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import React from 'react';
import { APIEndpoints, makeURL } from '../../../../utils/constants';
import useToast from '../../../../utils/hooks/useToast';
import { PrimaryButton } from '../../../brand/PrimaryButton';

enum RequestState {
	LOADING,
	AVAILABLE,
	SENT,
}

export const Account: React.FC = () => {
	const toast = useToast();

	return (
		<VStack justify='flex-start' w='full' align='flex-start'>
			<Box>
				<Heading>GDPR Data Request</Heading>
				<Text>
					It may take up to 30 days to collect your data. We&apos;ll send you an
					email containing a link to download your collection as soon as
					it&apos;s ready.
				</Text>
				<PrimaryButton
					mt={2}
					label='Request My Data'
					onClick={async () => {
						const { message, ok } = await fetch(makeURL(APIEndpoints.HARVEST), {
							method: 'POST',
						}).then(async (res) => ({ ok: res.ok, ...(await res.json()) }));

						toast({
							status: ok ? 'success' : 'error',
							// title: ok ? 'Collection started' : 'Error',
							description: message,
							position: 'bottom-right',
							isClosable: true,
						});
					}}
				/>
			</Box>
		</VStack>
	);
};
