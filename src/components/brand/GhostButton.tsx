import React from 'react';
import { Button, ButtonProps } from './Button';

export const GhostButton: React.FC<{ label: string } & ButtonProps> = (
	props
) => {
	return (
		<Button
			variant='ghost'
			colorScheme='orange'
			_dark={{ color: 'orange.300', _hover: { color: 'orange.400' } }}
			_light={{ color: 'orange.400', _hover: { color: 'orange.500' } }}
			// borderColor='orange.300'
			{...props}
		/>
	);
};
