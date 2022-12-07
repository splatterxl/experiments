import { ChakraProvider } from '@chakra-ui/react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import React from 'react';
import Navbar from '../components/navbar/Navbar';
import { Snowflakes } from '../components/Snowflakes';
import '../styles/globals.css';
import { cleanURL } from '../utils/analytics';

export default function App({ Component, pageProps }: AppProps) {
	const router = useRouter();

	React.useEffect(() => {
		cleanURL(router);
	}, [router]);

	return (
		<ChakraProvider>
			<Navbar />
			<Snowflakes />
			<Component {...pageProps} />
		</ChakraProvider>
	);
}
