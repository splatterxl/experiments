import React from 'react';
import { Button, ButtonProps } from './Button';

export const GhostButton: React.FC<
	{ actuallyGhost?: boolean; normalColor?: boolean } & ButtonProps
> = ({ actuallyGhost, normalColor, ...props }) => {
	return (
		<Button
			variant='ghost'
			colorScheme='orange'
			{...(normalColor
				? {}
				: {
						_dark: { color: 'orange.300', _hover: { color: 'orange.400' } },
						_light: { color: 'orange.400', _hover: { color: 'orange.500' } },
				  })}
			bgColor={actuallyGhost ? 'transparent !important' : undefined}
			// borderColor='orange.300'
			{...props}
		/>
	);
};
