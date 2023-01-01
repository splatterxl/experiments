import { Routes } from '@/utils/constants';
import { ChevronRightIcon } from '@chakra-ui/icons';
import {
	Box,
	Spinner,
	Tab,
	TabList,
	TabPanel,
	TabPanels,
	Tabs,
	useMediaQuery,
	VisuallyHidden,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React from 'react';

export enum SettingsPages {
	GENERAL,
	SERVERS,
	ACCOUNT,
	BILLING,
}

export const SettingsPage: React.FC<
	React.PropsWithChildren<{
		page: SettingsPages;
		isMain?: boolean;
		isMore?: boolean;
	}>
> = (props) => {
	const router = useRouter();

	const [xs, sm, md] = useMediaQuery([
		'(max-width: 250px)',
		'(max-width: 325px)',
		'(max-width: 450px)',
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

	const [loading, setLoading] = React.useState(-1);

	return (
		<Box px={10}>
			<Tabs
				index={props.isMore ? length + 1 : props.page}
				colorScheme='orange'
				isLazy
			>
				<TabList
					_selected={{ _light: { color: 'orange.300 !important' } }}
					_light={{ borderColor: 'blackAlpha.300' }}
				>
					{keys.map((v, i) => {
						const component = (
							<Tab
								key={v}
								onClick={() => {
									setLoading(i);

									router.push(
										{
											pathname: '/settings/[page]',
											query: { page: v.toLowerCase() },
										},
										`/settings/${v.toLowerCase()}`,
										{ scroll: true, shallow: false }
									);
								}}
							>
								{loading === i &&
								(!(props.isMain ?? true) ||
									props.page !== (i as SettingsPages)) ? (
									<Spinner size='sm' mx={5} />
								) : (
									`${v[0].toUpperCase()}${v.slice(1).toLowerCase()}`
								)}
							</Tab>
						);

						if (i >= length)
							return <VisuallyHidden>{component}</VisuallyHidden>;
						else return component;
					})}
					{md ? (
						<Tab
							onClick={() => {
								router.replace(Routes.MORE_SETTINGS);
							}}
						>
							<ChevronRightIcon rounded='lg' boxSize='1.3em' />
							<VisuallyHidden>More Settings</VisuallyHidden>
						</Tab>
					) : null}
				</TabList>

				<TabPanels>
					{Array.from(Array(props.isMore ? length + 1 : props.page), (_, v) => (
						<TabPanel key={v} />
					))}
					<TabPanel>{props.children}</TabPanel>
				</TabPanels>
			</Tabs>
		</Box>
	);
};
