import HTTPClient, { getGuilds } from '@/lib/http';
import { HStack, Select } from '@chakra-ui/react';
import {
	PermissionFlagsBits,
	RESTGetAPICurrentUserGuildsResult,
} from 'discord-api-types/v10';
import router from 'next/router';
import React from 'react';
import useToast from '../../hooks/useToast';
import { APIEndpoints, Routes } from '../../utils/constants';
import { PrimaryButton } from '../brand/PrimaryButton';

export const AssignSubscription: React.FC<
	React.PropsWithChildren<{
		subscription: string;
		product: string;
		prev?: string;
	}>
> = ({ subscription, product, prev }) => {
	const ref = React.useRef<HTMLSelectElement>(null as any);

	const [guilds, setGuilds] = React.useState<RESTGetAPICurrentUserGuildsResult>(
		[]
	);

	React.useEffect(() => {
		(async () => setGuilds((await getGuilds()) ?? []))();
	}, []);

	const toast = useToast();

	return (
		<HStack>
			<Select
				placeholder='Select a server'
				variant='outline'
				// borderColor={guilds.length ? '' : undefined}
				ref={ref}
				disabled={!guilds.length}
				defaultValue={prev}
			>
				{guilds
					.filter(
						(v) => BigInt(v.permissions!) & PermissionFlagsBits.ManageGuild
					)
					.map((guild) => (
						<option value={guild.id} key={guild.id}>
							{guild.name.slice(0, 50) + (guild.name.length > 50 ? '...' : '')}
						</option>
					))}
			</Select>
			<PrimaryButton
				label='Apply'
				px={7}
				onClick={async () => {
					if (ref.current.value) {
						const res = await HTTPClient.patch(
							APIEndpoints.SUBSCRIPTION(subscription),
							{
								guild_id: ref.current.value,
							}
						);

						if (res.ok) {
							router.push(
								prev
									? Routes.SUBSCRIPTION_SETTINGS(subscription)
									: Routes.SERVER_LIFTOFF(
											ref.current.value,
											product === 'Mailing List' ? 'mailing-list' : 'premium'
									  )
							);
						} else {
							const json = await res.json();

							toast({
								status: 'error',
								description: json.message,
							});
						}
					}
				}}
			/>
		</HStack>
	);
};
