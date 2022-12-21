import { HStack, Select, useToast } from '@chakra-ui/react';
import { APIGuild, PermissionFlagsBits } from 'discord-api-types/v10';
import router from 'next/router';
import React from 'react';
import { getGuilds } from '../../utils';
import { PrimaryButton } from '../brand/PrimaryButton';

export const AssignSubscription: React.FC<
	React.PropsWithChildren<{ subscription: string; product: string }>
> = ({ subscription, product }) => {
	const ref = React.useRef<HTMLSelectElement>(null as any);

	const [guilds, setGuilds] = React.useState<APIGuild[]>([]);

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
						const res = await fetch(
							'/api/billing/subscriptions/' + subscription,
							{
								method: 'PATCH',
								headers: {
									'Content-Type': 'application/json'
								},
								body: JSON.stringify({
									guild_id: ref.current.value
								})
							}
						);

						if (res.ok) {
							router.push(
								`/dashboard/guilds/${ref.current.value}/${
									product === 'Mailing List' ? 'mailing-list' : 'premium'
								}/liftoff`
							);
						} else {
							const json = await res.json();

							toast({
								status: 'error',
								description: json.message
							});
						}
					}
				}}
			/>
		</HStack>
	);
};
