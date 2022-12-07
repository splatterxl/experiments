import {
	Accordion,
	AccordionButton,
	AccordionIcon,
	AccordionItem,
	AccordionPanel,
	Box,
	Heading,
	HStack
} from '@chakra-ui/react';
import React from 'react';
import { PrimaryButton } from '../../../brand/PrimaryButton';

export const Debug: React.FC = () => {
	return (
		<>
			<Heading py={3}>Debug options</Heading>
			<Accordion allowMultiple allowToggle>
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
						<HStack>
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
						<HStack>
							<PrimaryButton
								label='Soft logout'
								onClick={() => {
									localStorage.removeItem('user');
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
