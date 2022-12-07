import { Center, Heading, Text } from '@chakra-ui/react';
import { OutlineButton } from '../../components/brand/OutlineButton';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { GhostButton } from '../../components/brand/GhostButton';

export default function Cancel() {
	return (
		<Center h='85vh' pb='20vh' flexDirection='column' textAlign='center'>
			<Heading>That&apos;s fine.</Heading>
			<Text fontSize='lg' maxW='50vw' textAlign='center'>
				Spending money on a whim is unhealthy. Whenever you&apos;re ready, you
				can always come back to try again!
			</Text>
			<GhostButton label='Go Home' icon={<ArrowBackIcon />} mt={3} href='/' />
		</Center>
	);
}
