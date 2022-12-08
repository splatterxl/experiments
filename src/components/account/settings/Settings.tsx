import { ChevronRightIcon } from '@chakra-ui/icons';
import {
	Box,
	Center,
	Spinner,
	Tab,
	TabList,
	TabPanel,
	TabPanels,
	Tabs,
	useMediaQuery,
	VisuallyHidden
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React from 'react';
import { Account } from './pages/Account';
import { Billing } from './pages/Billing';
import { Debug } from './pages/Debug';
import { General } from './pages/General';
import { PageList } from './pages/PageList';
import { Servers } from './pages/Servers';

export enum DashboardPages {
	GENERAL,
	SERVERS,
	ACCOUNT,
	BILLING
}

export const SettingsPage: React.FC<{ page: DashboardPages }> = (props) => {
	const router = useRouter();

	const [xs, sm, md] = useMediaQuery([
		'(max-width: 250px)',
		'(max-width: 325px)',
		'(max-width: 450px)'
	]);

	const maxLength = { xs: 1, sm: 2, md: 3 };

	const keys = Object.keys(DashboardPages).filter((v) => isNaN(parseInt(v)));

	const length = xs
		? maxLength.xs
		: sm
		? maxLength.sm
		: md
		? maxLength.md
		: keys.length + 1;

	const [localStorage, setLocalStorage] = React.useState<
		typeof window.localStorage
	>(null as any);

	React.useEffect(() => {
		setLocalStorage(window.localStorage);
	});

	return (
		<Box px={10}>
			<Tabs defaultIndex={props.page} colorScheme='orange'>
				<TabList
					_selected={{ _light: { color: 'orange.300 !important' } }}
					_light={{ borderColor: 'blackAlpha.300' }}
				>
					{keys.slice(0, length).map((v) => (
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
							{`${v[0].toUpperCase()}${v.slice(1).toLowerCase()}`}
						</Tab>
					))}
					{md ? (
						<Tab _selected={{}} _active={{ bgColor: 'transparent' }}>
							<ChevronRightIcon rounded='lg' />
							<VisuallyHidden>More Settings</VisuallyHidden>
						</Tab>
					) : null}
					{!md && process.env.NODE_ENV === 'development' ? (
						<Tab>Debug</Tab>
					) : null}
				</TabList>

				<TabPanels>
					{[General, Servers, Account, Billing, Debug]
						.slice(0, length)
						.concat(md ? [PageList] : [])
						.map((V, i) => (
							<TabPanel key={i}>
								{localStorage ? (
									// @ts-ignore
									<V storage={localStorage} />
								) : (
									<Center w='full' h='60vh'>
										<Spinner size='lg' />
									</Center>
								)}
							</TabPanel>
						))}
				</TabPanels>
			</Tabs>
		</Box>
	);
};
