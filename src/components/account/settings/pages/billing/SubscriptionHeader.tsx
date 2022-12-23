import { EditIcon } from '@chakra-ui/icons';
import {
	Badge,
	Heading,
	HStack,
	Text,
	VisuallyHidden,
	VStack
} from '@chakra-ui/react';
import Link from 'next/link';
import type { SubscriptionData } from '../../../../../pages/api/billing/subscriptions/[id]';
import { Months } from '../../../../../utils/constants/billing';
import { GuildIcon } from '../../../GuildIcon';

export default function SubscriptionHeader({
	subscription,
	index,
	length,
	main
}: {
	subscription: SubscriptionData;
	index: number;
	length: number;
	main?: boolean;
}) {
	const date = new Date(
		(subscription.cancels_at ??
			subscription.trial_ends_at ??
			subscription.renews_at!) * 1000
	);

	return (
		<HStack
			w='full'
			spacing={16}
			justify='space-between'
			rounded='md'
			roundedTop={!index || index === 0 ? 'md' : 'none'}
			roundedBottom={index === length - 1 ? 'md' : 'none'}
			p={4}
			_dark={{
				border: '2px solid',
				borderBottom: index === length - 1 ? undefined : 'none',
				borderColor: 'gray.500'
			}}
		>
			<HStack spacing={4}>
				{subscription.guild ? (
					<GuildIcon
						name={subscription.guild.name}
						hash={subscription.guild.icon!}
						id={subscription.guild.id!}
						size='lg'
					/>
				) : null}
				<VStack spacing={0} align='flex-start'>
					<HStack align='center'>
						<Heading size='lg'>{subscription.product.label}</Heading>
						{subscription.cancels_at ? (
							<Badge colorScheme='gray' fontSize='lg'>
								Cancelled
							</Badge>
						) : null}
					</HStack>
					<HStack align='center'>
						<Text fontWeight={400}>
							{subscription.guild?.name ?? 'Unassigned'}
						</Text>
						{main && !subscription.cancels_at ? (
							<Link
								href={{
									pathname: '/premium/liftoff',
									query: {
										product: subscription.product.label,
										subscription: subscription.id,
										prev_guild_id: subscription.guild?.id
									}
								}}
							>
								<EditIcon />
								<VisuallyHidden>
									{subscription.guild?.name
										? 'Change server'
										: 'Apply to server'}
								</VisuallyHidden>
							</Link>
						) : null}
					</HStack>
				</VStack>
			</HStack>
			<VStack spacing={0} display={{ base: 'none', md: 'flex' }}>
				<Text as='span' fontWeight={300}>
					{subscription.cancels_at
						? 'Cancels on'
						: subscription.trial_ends_at
						? 'Trial ends on'
						: subscription.payment_method
						? 'Renews on'
						: 'Expires on'}
				</Text>
				<Heading as='span' size='xl' textAlign='center' lineHeight={1}>
					{date.getDate()} {Months[date.getMonth()]}
				</Heading>
			</VStack>
		</HStack>
	);
}
