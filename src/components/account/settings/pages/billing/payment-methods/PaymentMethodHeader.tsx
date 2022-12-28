import { Badge, Heading, HStack, Image, Text, VStack } from '@chakra-ui/react';
import React from 'react';
import Stripe from 'stripe';
import {
	CardBrands,
	IdealBanks,
	PaymentMethods,
	WalletIcons,
	Wallets,
} from '../../../../../../utils/constants/billing';
import { PaymentMethod } from '../../../../../../utils/types';
import { CardIcon } from '../../../../../brand/icons/CardIcon';
import { IdealIcon } from '../../../../../brand/icons/IdealIcon';
import { LinkIcon } from '../../../../../brand/icons/LinkIcon';

export default function PaymentMethodHeader({
	pm,
	index,
	length,
	main,
}: {
	pm: PaymentMethod;
	index: number;
	length: number;
	main?: boolean;
}) {
	const label = getLabelForPMType(pm, index);

	return (
		<HStack w='full' justify='space-between' px={1}>
			<HStack spacing={4} w='full'>
				{label}
			</HStack>
		</HStack>
	);
}

export function getLabelForPMType(pm: PaymentMethod, index: number) {
	const defaultBadge =
		index === 0 ? (
			<Badge colorScheme='green' fontSize='lg'>
				Default
			</Badge>
		) : null;

	return (
		<>
			{getIconForPM(pm) ?? <CardIcon />}
			<VStack align='flex-start' spacing={0}>
				<Heading size='md' as={HStack}>
					<Text as='span'>{getLabelForPM(pm)}</Text>{' '}
					{index === 0 ? (
						<Badge colorScheme='green' fontSize='lg'>
							Default
						</Badge>
					) : null}
				</Heading>
				<Text fontWeight={400} fontSize='lg'>
					{getDetailsForPM(pm)}
				</Text>
			</VStack>
		</>
	);
}

export function getLabelForPM(pm: Stripe.PaymentMethod) {
	switch (pm.type) {
		case 'card': {
			const card = pm.card!;

			if (!card.wallet)
				return `${CardBrands[card.brand]} ending in ${card.last4}`;
			else return Wallets[card.wallet.type];
		}

		case 'ideal':
			return `iDEAL with ${IdealBanks[pm.ideal!.bank!] ?? 'Unknown'}`;

		default:
			return PaymentMethods[pm.type];
	}
}

export function getDetailsForPM(pm: Stripe.PaymentMethod) {
	switch (pm.type) {
		case 'card':
			return `Expires on ${pm.card!.exp_month}/${pm.card!.exp_year}`;
		default:
			return pm.billing_details.email;
	}
}

export function getIconForPM(pm: Stripe.PaymentMethod) {
	let Icon: React.ComponentType<{ boxSize: string }> | string = CardIcon;

	switch (pm.type) {
		case 'card': {
			const card = pm.card!;

			if (card.wallet) Icon = WalletIcons[card.wallet.type];
			else if (card.brand !== 'unknown')
				Icon = `/assets/card/${card.brand}.svg`;

			break;
		}
		case 'link':
			Icon = LinkIcon;
			break;
		case 'ideal':
			Icon = IdealIcon;
			break;
	}

	if (typeof Icon === 'string') {
		return <Image src={Icon} width='4em' alt='' />;
	} else {
		return <Icon boxSize='4em' />;
	}
}
