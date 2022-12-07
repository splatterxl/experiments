import { Badge, BadgeProps } from '@chakra-ui/react';
import React from 'react';

export const PremiumBadge: React.FC<BadgeProps> = (props) => {
	return (
		<Badge variant='subtle' colorScheme='orange' userSelect='none' {...props}>
			Premium
		</Badge>
	);
};
