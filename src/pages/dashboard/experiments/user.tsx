import { getBySearch } from '@/pages/api/v1/experiments/search';
import Dashboard from '@/pages/dashboard';

export default Dashboard;

export const getServerSideProps = async () => {
	const experiments = await getBySearch({
		type: 'user',
	});

	return {
		props: {
			experiments,
		},
	};
};
