import { SearchForm } from '@/components/experiments/SearchForm';
import { Experiment } from '@/lib/db/models';
import { getBySearch } from '@/pages/api/v1/experiments/search';
import { Divider, HStack, Heading, Text, VStack } from '@chakra-ui/react';
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Routes } from '../../utils/constants';

export default function Dashboard({
	experiments: data,
}: {
	experiments: Experiment[];
}) {
	const router = useRouter();

	return (
		<>
			<Head>
				<title>Dashboard | Experiments</title>
			</Head>
			<VStack w='full' justify='start' align='start'>
				<HStack justify='space-between' w='full'>
					<Heading size='lg'>
						Dashboard{' '}
						<Text as='span' fontSize='sm' fontWeight={300}>
							<Link
								href={Routes.EXPERIMENTS('user')}
								style={{
									textDecoration: router.pathname.endsWith('user')
										? 'underline'
										: 'none',
								}}
							>
								user
							</Link>{' '}
							•{' '}
							<Link
								href={Routes.EXPERIMENTS('guild')}
								style={{
									textDecoration: router.pathname.endsWith('guild')
										? 'underline'
										: 'none',
								}}
							>
								guild
							</Link>
						</Text>
					</Heading>
					<SearchForm />
				</HStack>
				<Divider />
				<HStack
					w='full'
					justify='start'
					align='start'
					flexWrap='wrap'
					spacing={0}
					gap={4}
				>
					{data ? (
						data
							.sort((a, b) => b.name?.localeCompare(a.name) ?? 1)
							.map((exp) => (
								<VStack
									as={Link}
									key={exp.hash_key}
									href={Routes.EXPERIMENT(exp.hash_key.toString())}
									p={4}
									borderWidth={1}
									rounded='md'
									justify='start'
									align='start'
								>
									<Heading size='md'>{exp.title}</Heading>
									<Heading size='xs' fontWeight={300}>
										{exp.no_name
											? exp.description
												? `[${exp.type}] • ${exp.description}`
												: `${exp.type[0].toUpperCase()}${exp.type.slice(
														1
												  )} experiment`
											: `${exp.name} • ${exp.type}`}
									</Heading>
									<Text fontWeight='500'>{exp.description}</Text>
								</VStack>
							))
					) : (
						<Text>Loading...</Text>
					)}
				</HStack>
			</VStack>
		</>
	);
}

export const getServerSideProps = async (
	context: GetServerSidePropsContext
) => {
	let page = parseInt(context.query.page?.toString() ?? ('0' as string));

	if (isNaN(page) ?? page < 0) {
		page = 0;
	}

	const experiments = await getBySearch({
		cursor: (50 * page).toString(),
	});

	return {
		props: {
			experiments,
		},
	};
};

export const runtime = 'edge';
