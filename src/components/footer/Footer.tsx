import { Heading, HStack, Link, List, ListItem, Stack } from '@chakra-ui/react';
import { Routes } from '../../utils/constants';

export const Footer = () => {
	return (
		<Stack
			direction={{ base: 'column', md: 'row' }}
			w='full'
			borderTopWidth={1}
			p={6}
			pr={8}
			justify='space-between'
		>
			<Heading size='sm' fontWeight={500}>
				&copy; Experiments, 2022-2023. All rights reserved.
			</Heading>
			<List as={HStack} spacing={0} gap={2}>
				<ListItem>
					<Link href={Routes.TERMS} style={{ fontWeight: 400 }}>
						Terms of Service
					</Link>
				</ListItem>
				<ListItem>
					<Link href={Routes.PRIVACY} style={{ fontWeight: 400 }}>
						Privacy Policy
					</Link>
				</ListItem>
			</List>
		</Stack>
	);
};
