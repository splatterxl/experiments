import { Box, ChakraProvider, VStack } from '@chakra-ui/react';
import '@stripe/stripe-js';
import { Analytics } from '@vercel/analytics/react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import React from 'react';
import { RecoilRoot } from 'recoil';
import { Footer } from '../components/footer/Footer';
import Navbar from '../components/navbar/Navbar';
import { Snowflakes } from '../components/Snowflakes';
import { PersistedStateProvider } from '../providers/PersistedStateProvider';
import '../styles/globals.css';
import { cleanURL } from '../utils/analytics';
import { THEME } from '../utils/constants/theme';

export default function App({ Component, pageProps }: AppProps) {
	const router = useRouter();

	React.useEffect(() => {
		cleanURL(router);
	}, [router]);

	return (
		<>
			<RecoilRoot>
				<PersistedStateProvider>
					<ChakraProvider theme={THEME}>
						<VStack
							minH='100vh'
							justify='space-between'
							_dark={{
								bg: 'linear-gradient(180deg, #1A202C 0%, #1f1b1a 100%)',
							}}
							_light={{
								bg: 'linear-gradient(180deg, #F7FAFC 0%, #f9f0df 100%)',
							}}
						>
							{/* <NavigationProgressBar /> */}
							<Box role='main' w='100vw' minH='100vh' suppressHydrationWarning>
								<Navbar />
								<Snowflakes />
								<Component {...pageProps} />
							</Box>
							<Footer />
						</VStack>
					</ChakraProvider>
					<Analytics />
				</PersistedStateProvider>
			</RecoilRoot>
		</>
	);
}
