import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Box, HStack, Link as ChakraLink, LinkProps } from '@chakra-ui/react';
import React from 'react';

export const Link: React.FC<
	Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps | 'ref'> &
		LinkProps & {
			children?: React.ReactNode;
		} & React.RefAttributes<HTMLAnchorElement>
> = (props) => {
	return (
		<HStack
			display='inline-flex'
			spacing={0}
			gap={1}
			as={ChakraLink}
			{...(props as any)}
		>
			<Box as='span' textDecoration='underline'>
				{props.children}
			</Box>
			{props.href?.toString().startsWith('http') ? <ExternalLinkIcon /> : null}
		</HStack>
	);
};

export const UnderlinedLink = Link;
