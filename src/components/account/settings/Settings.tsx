import { Box, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React from 'react';
import { Account } from './pages/Account';
import { Billing } from './pages/Billing';
import { Debug } from './pages/Debug';
import { General } from './pages/General';
import { Servers } from './pages/Servers';

export enum DashboardPages {
	GENERAL,
	SERVERS,
	ACCOUNT,
	BILLING
}

export const SettingsPage: React.FC<{ page: DashboardPages }> = (props) => {
	const router = useRouter();

	return (
		<Box px={10}>
			<Tabs defaultIndex={props.page} colorScheme='orange'>
				<TabList
					_selected={{ _light: { color: 'orange.300 !important' } }}
					_light={{ borderColor: 'blackAlpha.300' }}
				>
					{Object.keys(DashboardPages)
						.filter((v) => isNaN(parseInt(v)))
						.map((v) => (
							<Tab
								key={v}
								onClick={() => {
									router.push(
										{
											pathname: '/settings/[page]',
											query: { page: v.toLowerCase() }
										},
										`/settings/${v.toLowerCase()}`,
										{ scroll: true, shallow: true }
									);
								}}
							>
								{v[0].toUpperCase()}
								{v.slice(1).toLowerCase()}
							</Tab>
						))}
					{process.env.NODE_ENV === 'development' ? <Tab>Debug</Tab> : null}
				</TabList>

				<TabPanels>
					<TabPanel>
						<General />
					</TabPanel>
					<TabPanel>
						<Servers />
					</TabPanel>
					<TabPanel>
						<Account />
					</TabPanel>
					<TabPanel>
						<Billing />
					</TabPanel>
					<TabPanel>
						<Debug />
					</TabPanel>
				</TabPanels>
			</Tabs>
		</Box>
	);
};
