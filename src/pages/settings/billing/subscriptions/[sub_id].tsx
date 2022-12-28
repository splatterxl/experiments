import Head from 'next/head';
import {
	SettingsPage,
	SettingsPages,
} from '../../../../components/account/settings/Settings';

export default function Subscription() {
	return (
		<>
			<Head>
				<title>Settings | Experiments</title>
			</Head>
			<SettingsPage page={SettingsPages.BILLING} />
		</>
	);
}
