import { ChakraTheme, extendTheme } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

export const THEME = extendTheme({
	config: { initialColorMode: 'dark', useSystemColorMode: true },
	styles: {
		global: (props) => ({
			body: {
				bg: mode('#f3f2ef', '#1f1b1a')(props)
			}
		})
	}
} as Partial<ChakraTheme>);
