import {
	Badge,
	Heading,
	HStack,
	IconProps,
	Image,
	Text,
	VStack,
} from '@chakra-ui/react';
import React from 'react';
import Stripe from 'stripe';
import {
	CardBrands,
	EpsBanks,
	IdealBanks,
	PaymentMethodIcons,
	PaymentMethods,
	WalletIcons,
	Wallets,
} from '../../../../../../utils/constants/billing';
import { PaymentMethod } from '../../../../../../utils/types';
import { CardIcon } from '../../../../../brand/icons/CardIcon';

export default function PaymentMethodSmall({
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
	return (
		<HStack w='full' justify='flex-start' px={1}>
			<HStack spacing={4} w='full'>
				{getIconForPM(pm) ?? <CardIcon />}
				<VStack align='flex-start' spacing={0}>
					<Heading size='md' as={HStack}>
						<Text as='span'>{getLabelForPM(pm)}</Text>{' '}
						{pm.default ? (
							<Badge colorScheme='green' fontSize='lg'>
								Default
							</Badge>
						) : null}
					</Heading>
					<Text fontWeight={400} fontSize='lg'>
						{getDetailsForPM(pm)}
					</Text>
				</VStack>
			</HStack>
		</HStack>
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

		default:
			return PaymentMethods[pm.type];
	}
}

export function getDetailsForPM(pm: Stripe.PaymentMethod) {
	switch (pm.type) {
		case 'card':
			return `Expires on ${pm.card!.exp_month}/${pm.card!.exp_year}`;
		case 'ideal':
			return IdealBanks[pm.ideal!.bank!] ?? 'Unknown bank';
		case 'eps':
			return EpsBanks[pm.eps!.bank!] ?? 'Unknown bank';
		default:
			return pm.billing_details.email;
	}
}

export function getIconForPM(pm: Stripe.PaymentMethod, props?: IconProps) {
	let Icon: React.ComponentType<IconProps> | string = CardIcon;

	switch (pm.type) {
		case 'card': {
			const card = pm.card!;

			if (card.wallet) Icon = WalletIcons[card.wallet.type];
			else if (card.brand !== 'unknown')
				Icon = `/assets/card/${card.brand}.svg`;

			break;
		}
		default: {
			if (pm.type in PaymentMethodIcons) Icon = PaymentMethodIcons[pm.type]!;
		}
	}

	if (typeof Icon === 'string') {
		return (
			<Image
				src={Icon}
				width={props?.boxSize ?? props?.width ?? '3em'}
				alt=''
			/>
		);
	} else {
		return <Icon {...props} />;
	}
}
