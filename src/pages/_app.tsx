import { Box, ChakraProvider, VStack } from '@chakra-ui/react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import React from 'react';
import { Footer } from '../components/footer/Footer';
import Navbar from '../components/navbar/Navbar';
import { Snowflakes } from '../components/Snowflakes';
import '../styles/globals.css';
import { cleanURL } from '../utils/analytics';
import { THEME } from '../utils/constants/theme';

export default function App({ Component, pageProps }: AppProps) {
	const router = useRouter();

	React.useEffect(() => {
		cleanURL(router);
	}, [router]);

	return (
		<ChakraProvider theme={THEME}>
			<VStack
				minH='100vh'
				justify='space-between'
				_dark={{ bg: 'linear-gradient(90deg, #1A202C 0%, #1f1b1a 100%)' }}
				_light={{ bg: 'linear-gradient(90deg, #F7FAFC 0%, #f9f0df 100%)' }}
			>
				<Box role='main' w='100vw' minH='100vh'>
					<Navbar />
					<Snowflakes />
					<Component {...pageProps} />
				</Box>
				<Footer />
			</VStack>
		</ChakraProvider>
	);
}
