import { GuildIcon } from '@/components/account/GuildIcon';
import { Months } from '@/lib/billing/constants';
import { SubscriptionData } from '@/lib/billing/types';
import { Routes } from '@/utils/constants';
import { EditIcon } from '@chakra-ui/icons';
import {
	Badge,
	Heading,
	HStack,
	Link,
	Text,
	VisuallyHidden,
	VStack,
} from '@chakra-ui/react';
import { RESTAPIPartialCurrentUserGuild } from 'discord-api-types/v10';

export default function SubscriptionHeader({
	subscription,
	index,
	length,
	main,
	guild,
}: {
	subscription: SubscriptionData;
	index: number;
	length: number;
	main?: boolean;
	guild?: RESTAPIPartialCurrentUserGuild;
}) {
	const date = new Date(
		Math.max(
			subscription.cancels_at ?? 0,
			subscription.trial_ends_at ?? 0,
			subscription.renews_at!
		) * 1000
	);

	return (
		<HStack
			w='full'
			spacing={16}
			justify='space-between'
			rounded='lg'
			roundedTop={!index || index === 0 ? 'lg' : 'none'}
			roundedBottom={index === length - 1 ? 'lg' : 'none'}
			p={4}
			_dark={{
				border: '2px solid',
				borderBottom: index === length - 1 ? undefined : 'none',
				borderColor: 'gray.600',
			}}
			_light={{
				border: '2px solid',
				borderBottom: index === length - 1 ? undefined : 'none',
				borderColor: 'gray.400',
				bgColor: 'gray.100',
			}}
		>
			<HStack spacing={4}>
				{guild ? (
					<GuildIcon
						name={guild.name}
						hash={guild.icon!}
						id={guild.id!}
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
						<Text fontWeight={400} fontSize='lg'>
							{guild?.name ?? 'Unassigned'}
						</Text>
						{main && !subscription.cancels_at ? (
							<Link
								href={Routes.REASSIGN_SUBSCRIPTION(
									subscription.id,
									subscription.product.label,
									guild?.id
								)}
							>
								<EditIcon />
								<VisuallyHidden>
									{guild?.name ? 'Change server' : 'Apply to server'}
								</VisuallyHidden>
							</Link>
						) : null}
					</HStack>
				</VStack>
			</HStack>
			<VStack spacing={0} display={{ base: 'none', md: 'flex' }} pr={2}>
				<Text as='span' fontWeight={300}>
					{subscription.cancels_at === subscription.renews_at
						? 'Cancels on'
						: subscription.trial_ends_at === subscription.renews_at
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
