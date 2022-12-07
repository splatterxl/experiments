import React from 'react';
import { Button, ButtonProps } from './Button';

export const PrimaryButton: React.FC<ButtonProps> = (props) => {
	return (
		<Button
			variant='solid'
			colorScheme='orange'
			bgColor='orange.300'
			_hover={{ bgColor: 'orange.400' }}
			color='black'
			{...props}
		/>
	);
};
