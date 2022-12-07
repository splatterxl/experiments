import { Badge, BadgeProps } from '@chakra-ui/react';
import React from 'react';

export const ComingSoonBadge: React.FC<BadgeProps> = (props) => {
	return (
		<Badge variant='subtle' colorScheme='green' userSelect='none' {...props}>
			Coming Soon
		</Badge>
	);
};
