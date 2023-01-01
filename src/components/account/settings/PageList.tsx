import { Routes } from '@/utils/constants';
import { List, ListItem } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React from 'react';
import { Button } from '../../brand/Button';

export const PageList: React.FC = () => {
	const router = useRouter();

	return (
		<List>
			<ListItem>
				<Button
					w='full'
					align='left'
					variant='outline'
					borderTop='none'
					borderX='none'
					rounded='none'
					colorScheme='orange'
					bgColor='transparent !important'
					label='General'
					onClick={() => {
						router.push(Routes.SETTINGS);
					}}
				/>
				<Button
					w='full'
					align='left'
					variant='outline'
					borderTop='none'
					borderX='none'
					rounded='none'
					colorScheme='orange'
					bgColor='transparent !important'
					label='Servers'
					onClick={() => {
						router.push(Routes.SERVER_SETTINGS);
					}}
				/>
				<Button
					w='full'
					align='left'
					variant='outline'
					borderTop='none'
					borderX='none'
					rounded='none'
					colorScheme='orange'
					bgColor='transparent !important'
					label='Account'
					onClick={() => {
						router.push(Routes.ACCOUNT_SETTINGS);
					}}
				/>
				<Button
					w='full'
					align='left'
					variant='outline'
					borderTop='none'
					borderX='none'
					rounded='none'
					colorScheme='orange'
					bgColor='transparent !important'
					label='Billing'
					onClick={() => {
						router.push(Routes.BILLING_SETTINGS);
					}}
				/>
			</ListItem>
		</List>
	);
};
