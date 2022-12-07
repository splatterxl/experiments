import { Center, Spinner } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React from 'react';

export default function Logout() {
	const router = useRouter();

	React.useEffect(() => {
		localStorage.removeItem('user');

		router.replace('/api/auth/logout');
	});

	return (
		<Center w='full' h='80vh'>
			<Spinner size='lg' />
		</Center>
	);
}
