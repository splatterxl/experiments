import React from 'react';
import { Button, ButtonProps } from './Button';

export const GhostButton: React.FC<{ label: string } & ButtonProps> = (
	props
) => {
	return (
		<Button
			variant='ghost'
			colorScheme='orange'
			_hover={{ color: 'orange.400' }}
			color='orange.300'
			// borderColor='orange.300'
			{...props}
		/>
	);
};
