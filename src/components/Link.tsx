import NextLink, { LinkProps } from 'next/link';
import React from 'react';

export const Link: React.FC<
	Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> &
		LinkProps & {
			children?: React.ReactNode;
		} & React.RefAttributes<HTMLAnchorElement>
> = (props) => {
	return <NextLink style={{ textDecoration: 'underline' }} {...props} />;
};
