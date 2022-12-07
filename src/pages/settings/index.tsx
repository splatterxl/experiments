import Head from 'next/head';
import { SettingsPage } from '../../components/account/settings/Settings';

export default function Dashboard() {
	return (
		<>
			<Head>
				<title>Settings | Experiments</title>
			</Head>
			<SettingsPage page={0} />
		</>
	);
}
