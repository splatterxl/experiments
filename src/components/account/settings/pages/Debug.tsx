import {
	Accordion,
	AccordionButton,
	AccordionIcon,
	AccordionItem,
	AccordionPanel,
	Box,
	Heading,
	HStack,
	useColorMode
} from '@chakra-ui/react';
import { destroyCookie } from 'nookies';
import React from 'react';
import { PrimaryButton } from '../../../brand/PrimaryButton';

export const Debug: React.FC = () => {
	const colorMode = useColorMode();

	return (
		<>
			<Heading pb={3}>Debug options</Heading>
			<PrimaryButton
				mb={3}
				label='Toggle color mode'
				onClick={() => {
					colorMode.toggleColorMode();
				}}
			/>
			<Accordion allowMultiple>
				<AccordionItem>
					<h2>
						<AccordionButton>
							<Box flex='1' textAlign='left'>
								Checkout
							</Box>
							<AccordionIcon />
						</AccordionButton>
					</h2>
					<AccordionPanel pb={4}>
						<HStack flexWrap='wrap' spacing={0} gap={2}>
							<PrimaryButton label='Default' href='/api/billing/checkout' />
							<PrimaryButton
								label='Premium (monthly)'
								href='/api/billing/checkout?product=premium&trial=false'
							/>
							<PrimaryButton
								label='Premium (monthly, trial)'
								href='/api/billing/checkout?product=premium&trial=true'
							/>
							<PrimaryButton
								label='Premium (yearly)'
								href='/api/billing/checkout?product=premium&price=yearly&trial=false'
							/>
							<PrimaryButton
								label='Premium (yearly, trial)'
								href='/api/billing/checkout?product=premium&price=yearly&trial=true'
							/>
							<PrimaryButton
								label='Mailing list'
								href='/api/billing/checkout?product=mailing_list&trial=false'
							/>
							<PrimaryButton
								label='Mailing list (trial)'
								href='/api/billing/checkout?product=mailing_list&trial=true'
							/>
						</HStack>
					</AccordionPanel>
				</AccordionItem>
				<AccordionItem>
					<h2>
						<AccordionButton>
							<Box flex='1' textAlign='left'>
								Authentication
							</Box>
							<AccordionIcon />
						</AccordionButton>
					</h2>
					<AccordionPanel pb={4}>
						<HStack flexWrap='wrap' spacing={0} gap={2}>
							<PrimaryButton
								label='Soft logout'
								onClick={() => {
									localStorage.removeItem('user');
								}}
							/>
							<PrimaryButton
								label='Delete cookies'
								onClick={() => {
									destroyCookie(null, 'auth', { path: '/' });
								}}
							/>
							<PrimaryButton label='Login again' href='/auth/login' />
							<PrimaryButton label='Logout' href='/auth/logout' />
						</HStack>
					</AccordionPanel>
				</AccordionItem>
			</Accordion>
		</>
	);
};
