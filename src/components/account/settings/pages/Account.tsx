import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import React from 'react';
import { APIEndpoints, makeURL } from '../../../../utils/constants';
import useToast from '../../../../utils/hooks/useToast';
import { request } from '../../../../utils/http';
import { PrimaryButton } from '../../../brand/PrimaryButton';

enum RequestState {
	LOADING,
	AVAILABLE,
	SENT
}

export const Account: React.FC = () => {
	const toast = useToast();

	const [state, setState] = React.useState<RequestState>(RequestState.LOADING);

	React.useEffect(() => {
		request(makeURL(APIEndpoints.HARVEST))
			.then((res) => res.json())
			.then(({ status }: { status: boolean }) => {
				if (status) setState(RequestState.SENT);
				else setState(RequestState.AVAILABLE);
			});
	}, []);

	return (
		<VStack justify='flex-start' w='full' align='flex-start'>
			<Box>
				<Heading>GDPR Data Request</Heading>
				<Text>
					It may take up to 30 days to collect your data. We&apos;ll send you an
					email containing a link to download your collection as soon as
					it&apos;s ready.
				</Text>
				{state === RequestState.SENT ? (
					<Text mt={1}>
						Your data harvest request is in progress. You should receive an
						email to your Discord account&apos;s email address shortly.
					</Text>
				) : null}
				<PrimaryButton
					mt={2}
					disabled={[RequestState.SENT, RequestState.LOADING].includes(state)}
					isLoading={state === RequestState.LOADING}
					label='Request My Data'
					onClick={async () => {
						const { message, ok } = await request(
							makeURL(APIEndpoints.HARVEST),
							{
								method: 'POST'
							}
						).then(async (res) => ({ ok: res.ok, ...(await res.json()) }));

						toast({
							status: ok ? 'success' : 'error',
							// title: ok ? 'Collection started' : 'Error',
							description: message,
							position: 'bottom-right',
							isClosable: true
						});

						setState(RequestState.SENT);
					}}
				/>
			</Box>
		</VStack>
	);
};
