import { ColorModeScript } from '@chakra-ui/react';
import { Head, Html, Main, NextScript } from 'next/document.js';

export default function Document() {
	return (
		<Html lang='en'>
			<Head>
				{process.env.NODE_ENV === 'development' ? (
					// eslint-disable-next-line @next/next/no-sync-scripts
					<script src='http://localhost:8097'></script>
				) : null}
			</Head>
			<body>
				<ColorModeScript />
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
