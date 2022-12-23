import { Box, HStack } from '@chakra-ui/react';
import NextLink, { LinkProps } from 'next/link';
import React from 'react';

export const Link: React.FC<
	Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> &
		LinkProps & {
			children?: React.ReactNode;
		} & React.RefAttributes<HTMLAnchorElement>
> = (props) => {
	return (
		<NextLink
			passHref
			legacyBehavior
			style={{ textDecoration: 'underline' }}
			{...props}
		>
			<HStack as='a' display='inline-flex'>
				<Box as='span'>{props.children}</Box>
			</HStack>
		</NextLink>
	);
};
