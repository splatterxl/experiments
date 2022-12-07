import { ColorModeScript } from '@chakra-ui/react';
import { Head, Html, Main, NextScript } from 'next/document.js';

export default function Document() {
	return (
		<Html>
			<Head>
				{/* eslint-disable-next-line @next/next/no-sync-scripts */}
				<script src='http://localhost:8097'></script>
			</Head>
			<body>
				<ColorModeScript />
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
