import { ArrowBackIcon } from '@chakra-ui/icons';
import { Center, Heading, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { GhostButton } from '../../../components/brand/GhostButton';

export default function TryAgain() {
	const router = useRouter();

	return (
		<Center h='85vh' pb='20vh' flexDirection='column' textAlign='center'>
			<Heading>Couldn&apos;t log you in</Heading>
			<Text fontSize='lg' maxW='50vw' textAlign='center'>
				An unexpected error occurred while trying to log you in with Discord.
				Please try again.
			</Text>
			<GhostButton
				label='Back to Login'
				icon={<ArrowBackIcon />}
				mt={3}
				onClick={() => {
					router.replace('/auth/login');
				}}
			/>
		</Center>
	);
}
