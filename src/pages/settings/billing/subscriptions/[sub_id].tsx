import {
	SettingsPage,
	SettingsPages,
} from '@/components/account/settings/Settings';
import Head from 'next/head';

export default function Subscription() {
	return (
		<>
			<Head>
				<title>Settings | Experiments</title>
			</Head>
			<SettingsPage page={SettingsPages.BILLING}></SettingsPage>
		</>
	);
}
