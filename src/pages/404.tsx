import { ArrowBackIcon } from '@chakra-ui/icons';
import { Center, Heading, Text } from '@chakra-ui/react';
import { GhostButton } from '../components/brand/GhostButton';

export default function Cancel() {
	return (
		<Center h='85vh' pb='20vh' flexDirection='column' textAlign='center'>
			<Heading>Not Found</Heading>
			<Text fontSize='lg' maxW='50vw' textAlign='center'>
				The page you&apos;re looking for moved or does not exist.
			</Text>
			<GhostButton label='Go Home' icon={<ArrowBackIcon />} mt={3} href='/' />
		</Center>
	);
}
