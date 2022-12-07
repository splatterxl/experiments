import { Box, ChakraProvider } from '@chakra-ui/react';
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
			<Box
				w='100vw'
				minH='100vh'
				_dark={{ bg: 'linear-gradient(45deg, #1A202C 0%, #1f1b1a 100%)' }}
				_light={{ bg: 'linear-gradient(45deg, #F7FAFC 0%, #f9f0df 100%)' }}
			>
				<Navbar />
				<Snowflakes />
				<Component {...pageProps} />
			</Box>
		</ChakraProvider>
	);
}
