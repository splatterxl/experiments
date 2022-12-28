import {
	Button as ChakraButton,
	ButtonProps as ChakraProps,
	HStack,
	StackProps,
	Text,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React from 'react';
import { Url } from 'url';

export const Button: React.FC<ButtonProps> = ({
	label,
	icon,
	iconOnly,
	iconPos,
	href,
	align,
	...props
}) => {
	const router = useRouter();
	const [loading, setLoading] = React.useState(false);

	return (
		<ChakraButton
			isLoading={loading}
			{...props}
			onClick={async (event) => {
				if (href) {
					router.push(href);
				} else if (props.onClick) {
					setLoading(true);

					try {
						await props.onClick?.(event);
					} catch (err) {
						console.error(err);
					}

					setLoading(false);
				}
			}}
		>
			<HStack justify={align} align={align}>
				{iconPos !== 'right' ? icon : null}
				<Text display={iconOnly ? 'none' : undefined}>{label}</Text>
				{iconPos === 'right' ? icon : null}
			</HStack>
		</ChakraButton>
	);
};

export interface ButtonProps extends ChakraProps {
	label: string;
	icon?: React.ReactNode;
	iconOnly?: React.ReactNode;
	iconPos?: 'left' | 'right';
	href?: Partial<Url> | string;
	align?: StackProps['justify'];
}
