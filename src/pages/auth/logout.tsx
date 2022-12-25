import { Center, Spinner } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React from 'react';
import { APIEndpoints, makeURL } from '../../utils/constants';

export default function Logout() {
	const router = useRouter();

	React.useEffect(() => {
		localStorage.removeItem('user');
		localStorage.removeItem('scope');

		router.replace(makeURL(APIEndpoints.LOGOUT));
	});

	return (
		<Center w='full' h='80vh'>
			<Spinner size='lg' />
		</Center>
	);
}
