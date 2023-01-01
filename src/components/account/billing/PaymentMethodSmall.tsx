import { CardIcon } from '@/components/brand/icons/CardIcon';
import {
	CardBrands,
	EpsBanks,
	IdealBanks,
	PaymentMethodIcons,
	PaymentMethods,
	WalletIcons,
	Wallets,
} from '@/lib/billing/constants';
import { PaymentMethod } from '@/lib/billing/types';
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

export function getLabelForPM(pm: PaymentMethod) {
	switch (pm.type) {
		case 'card': {
			if (!pm.wallet) return `${CardBrands[pm.brand!]} ending in ${pm.last4}`;
			else return Wallets[pm.wallet.type];
		}

		default:
			return PaymentMethods[pm.type];
	}
}

export function getDetailsForPM(pm: PaymentMethod) {
	switch (pm.type) {
		case 'card':
			return `Expires on ${pm.exp}`;
		case 'ideal':
			return IdealBanks[pm.ideal!] ?? 'Unknown bank';
		case 'eps':
			return EpsBanks[pm.eps!] ?? 'Unknown bank';
		default:
			return pm.email;
	}
}

export function getIconForPM(pm: PaymentMethod, props?: IconProps) {
	let Icon: React.ComponentType<IconProps> | string = CardIcon;

	switch (pm.type) {
		case 'card': {
			if (pm.wallet) Icon = WalletIcons[pm.wallet.type];
			else if (pm.brand !== 'unknown') Icon = `/assets/card/${pm.brand}.svg`;

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
