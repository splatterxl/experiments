import { List, ListItem } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React from 'react';
import { Button } from '../../../brand/Button';

export const PageList: React.FC<{ setIndex: (i: number) => void }> = ({
	setIndex
}) => {
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
						setIndex(0);
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
						setIndex(1);
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
						setIndex(2);
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
						setIndex(3);
					}}
				/>
			</ListItem>
		</List>
	);
};
