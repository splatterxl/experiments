import { PageList } from '@/components/account/settings/PageList';
import Head from 'next/head';
import {
	SettingsPage,
	SettingsPages,
} from '../../components/account/settings/Settings';

export default function Dashboard() {
	return (
		<>
			<Head>
				<title>Settings | Experiments</title>
			</Head>
			<SettingsPage page={SettingsPages.GENERAL} isMore>
				<PageList />
			</SettingsPage>
		</>
	);
}
