import { ChakraTheme, extendTheme } from '@chakra-ui/react';

export const THEME = extendTheme({
	config: { initialColorMode: 'dark', useSystemColorMode: true }
} as Partial<ChakraTheme>);
