import React from 'react';
import { Button, ButtonProps } from './Button';

export const OutlineButton: React.FC<{ label: string } & ButtonProps> = (
	props
) => {
	return (
		<Button
			variant='outline'
			colorScheme='orange'
			// 	_hover={{ borderColor: 'orange.400', color: 'orange.400' }}
			//   color='orange.300'
			// borderColor='orange.300'
			{...props}
		/>
	);
};
