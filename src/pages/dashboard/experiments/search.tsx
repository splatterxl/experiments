import { getBySearch } from '@/pages/api/v1/experiments/search';
import Dashboard from '@/pages/dashboard';
import { GetServerSidePropsContext } from 'next';

export default Dashboard;

export const getServerSideProps = async (
	context: GetServerSidePropsContext
) => {
	const { query } = context.query;

	if (!query) {
		return {
			notFound: true,
		};
	}

	const experiments = await getBySearch({
		q: query?.toString(),
	});

	return {
		props: {
			experiments,
			query,
		},
	};
};
