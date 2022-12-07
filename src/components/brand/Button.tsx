import {
	Button as ChakraButton,
	ButtonProps as ChakraProps,
	HStack,
	Text
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React from 'react';
import { Url } from 'url';

export const Button: React.FC<ButtonProps> = ({
	label,
	icon,
	iconPos,
	href,
	...props
}) => {
	const router = useRouter();

	return (
		<ChakraButton
			onClick={() => {
				if (href) {
					router.push(href);
				}
			}}
			{...props}
		>
			<HStack>
				{iconPos !== 'right' ? icon : null}
				<Text>{label}</Text>
				{iconPos === 'right' ? icon : null}
			</HStack>
		</ChakraButton>
	);
};

export interface ButtonProps extends ChakraProps {
	label: string;
	icon?: React.ReactNode;
	iconPos?: 'left' | 'right';
	href?: Url | string;
}
