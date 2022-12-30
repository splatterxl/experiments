import { useToast as useChakraToast } from '@chakra-ui/react';

export default function useToast() {
	return useChakraToast({
		position: 'bottom-right',
		isClosable: true,
	});
}
