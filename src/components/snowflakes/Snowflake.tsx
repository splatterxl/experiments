import { Text } from '@chakra-ui/react';
import React from 'react';

export const Snowflake: React.FC = () => {
	return (
		<Text
			fontSize='1em'
			color='white'
			fontFamily='Arial, sans-serif'
			// textShadow='0 0 5px #000'
			className='snowflake'
			aria-hidden
		>
			❅
		</Text>
	);
};
