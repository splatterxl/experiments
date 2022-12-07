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
				{icon}
				<Text>{label}</Text>
			</HStack>
		</ChakraButton>
	);
};

export interface ButtonProps extends ChakraProps {
	label: string;
	icon?: React.ReactNode;
	href?: Url | string;
}
