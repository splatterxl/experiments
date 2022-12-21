import { GetStaticPropsContext } from 'next';
import Head from 'next/head';
import {
	SettingsPage,
	SettingsPages
} from '../../components/account/settings/Settings';
import { one } from '../../utils';

export default function Dashboard(props: DashboardProps) {
	return (
		<>
			<Head>
				<title>Settings | Experiments</title>
			</Head>
			<SettingsPage page={props.page} />
		</>
	);
}

interface DashboardProps {
	page: number;
	title: string;
}

export async function getStaticPaths() {
	return {
		paths: Object.values(SettingsPages)
			.filter((v) => typeof v === 'string')
			.map((v) => ({ params: { page: v.toString().toLowerCase() } })),
		fallback: false
	};
}

export async function getStaticProps({ params }: GetStaticPropsContext) {
	if (!params) throw 'no params';

	const page = one(params.page)!;

	return {
		props: {
			page: SettingsPages[page.toUpperCase() as keyof typeof SettingsPages],
			title: page[0].toUpperCase() + page.slice(1).toLowerCase()
		}
	};
}
