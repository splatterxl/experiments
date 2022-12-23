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
import { parseCookies } from 'nookies';
import React from 'react';
import { login } from '../../../utils/actions/login';
import { Account } from './pages/Account';
import { Billing } from './pages/Billing';
import { Debug } from './pages/Debug';
import { General } from './pages/General';
import { PageList } from './pages/PageList';
import { Servers } from './pages/Servers';

export enum SettingsPages {
	GENERAL,
	SERVERS,
	ACCOUNT,
	BILLING
}

export const SettingsPage: React.FC<{ page: SettingsPages }> = (props) => {
	const router = useRouter();

	const [xs, sm, md] = useMediaQuery([
		'(max-width: 250px)',
		'(max-width: 325px)',
		'(max-width: 450px)'
	]);

	const maxLength = { xs: 1, sm: 2, md: 3 };

	const keys = Object.keys(SettingsPages).filter((v) => isNaN(parseInt(v)));

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

	const cookies = parseCookies();

	React.useEffect(() => {
		if (!cookies.auth) {
			login('settings', router.asPath);
			return;
		}

		setLocalStorage(window.localStorage);
	}, [cookies.auth, router]);

	const [index, setIndex] = React.useState(props.page);

	if (!localStorage) {
		return (
			<Center w='full' h='60vh'>
				<Spinner size='lg' />
			</Center>
		);
	}

	return (
		<Box px={10}>
			<Tabs index={index} onChange={setIndex} colorScheme='orange' isLazy>
				<TabList
					_selected={{ _light: { color: 'orange.300 !important' } }}
					_light={{ borderColor: 'blackAlpha.300' }}
				>
					{keys.map((v, i) => {
						const component = (
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
						);

						if (i >= length)
							return <VisuallyHidden>{component}</VisuallyHidden>;
						else return component;
					})}
					{md ? (
						<Tab>
							<ChevronRightIcon rounded='lg' boxSize='1.3em' />
							<VisuallyHidden>More Settings</VisuallyHidden>
						</Tab>
					) : null}
					{!md && process.env.NODE_ENV === 'development' ? (
						<Tab>Debug</Tab>
					) : null}
				</TabList>

				<TabPanels>
					{[General, Servers, Account, Billing, Debug].map((V, i) => (
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
					{md ? (
						<TabPanel>
							<PageList setIndex={setIndex} />
						</TabPanel>
					) : null}
				</TabPanels>
			</Tabs>
		</Box>
	);
};
