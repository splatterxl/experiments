import { GuildExpRollout } from '@/components/experiments/GuildExpRollout';
import useToast from '@/hooks/useToast';
import { Experiment, ExperimentRollout } from '@/lib/db/models';
import { getExperimentByName } from '@/lib/experiments';
import { Routes } from '@/utils/constants';
import {
	Center,
	Divider,
	Heading,
	Table,
	TableContainer,
	Tbody,
	Td,
	Text,
	Th,
	Thead,
	Tr,
	VStack,
} from '@chakra-ui/react';
import { GetServerSidePropsResult, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import Link from 'next/link';

export default function ExperimentInfo({
	experiment,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	const toast = useToast();

	console.log(experiment);

	if (Array.isArray(experiment))
		return (
			<Center flexDirection='column'>
				<Heading>This experiment</Heading>
			</Center>
		);

	return (
		<>
			<Head>
				<title>{`${experiment.title ?? experiment.name} | Experiments`}</title>
			</Head>
			<VStack w='full' justify='start' align='start'>
				<Heading size='lg' maxW='70vw' lineHeight={1}>
					{experiment.title ?? experiment.name}{' '}
					<Text
						as='span'
						fontSize='md'
						fontWeight={300}
						cursor='pointer'
						display={{ base: 'block', md: 'inline-block' }}
						pt={3}
						pb={{ base: 0, md: 1 }}
					>
						{!experiment.no_name ? (
							<>
								<span
									onClick={() => {
										navigator.clipboard.writeText(
											experiment.title
												? experiment.name
												: experiment.hash_key.toString()
										);

										toast({
											status: 'info',
											description: `Copied experiment ${
												experiment.title ? 'name' : 'hash'
											} to clipboard.`,
										});
									}}
								>
									{experiment.title ? experiment.name : experiment.hash_key}
								</span>{' '}
								•{' '}
							</>
						) : null}
						<Link
							href={Routes.EXPERIMENTS(experiment.type)}
							style={{ fontWeight: 300 }}
						>
							{experiment.type}
						</Link>
					</Text>
				</Heading>
				{experiment.holdout ? (
					<Text>
						This experiment depends on{' '}
						<Link
							href={{
								pathname: '/dashboard/experiments/[hash_key]',
								query: { hash_key: experiment.holdout[0] },
							}}
						>
							{experiment.holdout[0]}
						</Link>{' '}
						being{' '}
						{experiment.holdout[1] === 0
							? 'disabled'
							: `assigned to bucket ${experiment.holdout[1]}`}
						.
					</Text>
				) : null}
				<Text>{experiment.description}</Text>
				<Divider />
				<VStack
					w='full'
					justify='start'
					align='start'
					flexWrap='wrap'
					pt={2}
					spacing={5}
				>
					{experiment.type === 'guild' ? (
						<Text>
							Some of this information may be incorrect or outdated. Take this
							data with a grain of salt, as some methods used to identify the
							roll-out for experiments are unreliable.
						</Text>
					) : null}
					{experiment.buckets ? (
						<VStack minW='50vw' justify='start' align='start'>
							<Heading size='sm'>Buckets</Heading>
							<TableContainer w='full'>
								<Table w='full'>
									<Thead>
										<Tr>
											<Th>Name</Th>
											<Th>Description</Th>
										</Tr>
									</Thead>
									<Tbody>
										{experiment.buckets.map((bucket) => (
											<Tr key={bucket.name}>
												<Td>{bucket.name}</Td>
												<Td>
													{bucket.description?.replace(
														new RegExp(`^${bucket.name}:?`),
														''
													) || <i>No description provided by Discord</i>}
												</Td>
											</Tr>
										))}
									</Tbody>
								</Table>
							</TableContainer>
						</VStack>
					) : null}
					{experiment.type === 'guild' ? (
						<GuildExpRollout {...(experiment as ExperimentRollout)} />
					) : null}
				</VStack>
			</VStack>
		</>
	);
}

export const getServerSideProps = async (
	context: any
): Promise<
	GetServerSidePropsResult<{ experiment: Experiment | Experiment[] }>
> => {
	const { hash_key } = context.query;

	const experiment = await getExperimentByName(hash_key);

	console.log(experiment);

	if (!experiment)
		return {
			notFound: true,
		};

	// @ts-ignore
	delete experiment._id;

	return {
		props: {
			experiment: (Array.isArray(experiment)
				? experiment.map((experiment) =>
						Object.fromEntries(
							Object.entries(experiment).map(([k, v]) => [k, v ?? null])
						)
				  )
				: Object.fromEntries(
						Object.entries(experiment).map(([k, v]) => [k, v ?? null])
				  )) as any,
		},
	};
};
