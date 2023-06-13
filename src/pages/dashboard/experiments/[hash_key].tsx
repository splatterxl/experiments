import { GuildExpRollout } from '@/components/experiments/GuildExpRollout';
import useToast from '@/hooks/useToast';
import { Experiment, ExperimentRollout } from '@/lib/db/models';
import { getExperiment } from '@/lib/experiments';
import { Routes } from '@/utils/constants';
import {
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
import { GetServerSidePropsResult } from 'next';
import Head from 'next/head';
import Link from 'next/link';

export default function ExperimentInfo({
	experiment,
}: {
	experiment: Experiment;
}) {
	const toast = useToast();

	console.log(experiment);

	return (
		<>
			<Head>
				<title>{`${experiment.title} | Experiments`}</title>
			</Head>
			<VStack w='full' justify='start' align='start'>
				<Heading size='lg' maxW='70vw' lineHeight={1}>
					{experiment.title}{' '}
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
										navigator.clipboard.writeText(experiment.name);

										toast({
											status: 'info',
											description: 'Copied experiment name to clipboard.',
										});
									}}
								>
									{experiment.name}
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
): Promise<GetServerSidePropsResult<{ experiment: Experiment }>> => {
	const { hash_key } = context.query;

	const experiment = await getExperiment(parseInt(hash_key));

	console.log(experiment);

	if (!experiment)
		return {
			notFound: true,
		};

	// @ts-ignore
	delete experiment._id;

	return {
		props: {
			experiment,
		},
	};
};
