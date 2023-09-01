import { GuildBuckets } from '@/components/experiments/GuildBuckets';
import { ExperimentRollout } from '@/lib/db/models';
import { parseNewFilters } from '@/lib/experiments/render';
import { getBucket, getExperimentRollout } from '@/lib/experiments/web';
import {
	Accordion,
	AccordionButton,
	AccordionIcon,
	AccordionItem,
	AccordionPanel,
	Box,
	Code,
	Heading,
	Table,
	TableContainer,
	Tbody,
	Td,
	Th,
	Thead,
	Tr,
	VStack,
} from '@chakra-ui/react';
import { Chart } from 'chart.js/auto';
import { FC, useEffect, useRef, useState } from 'react';

export const GuildExpRollout: FC<ExperimentRollout> = (exp) => {
	const { unfiltered, filtered } = getExperimentRollout(exp);

	const ref = useRef<HTMLCanvasElement>(null);

	const [, setChart] = useState<Chart | null>(null);

	useEffect(() => {
		setChart((chart) => {
			if (!ref.current) {
				return chart;
			}

			chart?.destroy();

			return new Chart(ref.current, {
				type: 'bar',
				data: {
					labels: exp.buckets.map((v) => v.name),
					datasets: [...unfiltered, ...filtered]
						.filter((v) => v !== null && v !== undefined)
						.map(((v: NonNullable<(typeof filtered)[0]>) => ({
							label: parseNewFilters(v.filters),
							data: v.percentages,
						})) as any) as any as { label: string; data: number[] }[],
				},
				options: {
					scales: {
						y: {
							beginAtZero: true,
						},
					},
				},
			});
		});

		setLoaded(true);

		// eslint-disable-next-line react-hooks/exhaustive-deps -- unfiltered will change if filtered does
	}, [exp.buckets]);

	const [loaded, setLoaded] = useState(false);

	return (
		<>
			<VStack minW='50vw' justify='start' align='start' w='full'>
				<Heading size='sm'>Rollout</Heading>
				<TableContainer w='full' pb={5}>
					<Table variant='simple'>
						<Thead>
							<Tr>
								<Th>Filter</Th>
								{exp.buckets.map((bucket) => (
									<Th isNumeric key={bucket.name}>
										{bucket.name}
									</Th>
								))}
							</Tr>
						</Thead>
						<Tbody>
							{(filtered.length &&
							unfiltered?.every((f) => f.percentages[0] === 100)
								? filtered
								: [...unfiltered, ...(filtered ?? [])]
							)
								.filter((r) => r)
								.map((rollout, i) => (
									<Tr key={i}>
										<Td>{parseNewFilters(rollout.filters)}</Td>
										{exp.buckets.map((_, i) => (
											<Td
												isNumeric
												key={i}
												// emulate being highlighted
												color={
													rollout.percentages[i] > 0 ? 'green.400' : 'red.400'
												}
												fontWeight={
													rollout.percentages[i] === 100
														? 'black'
														: rollout.percentages[i] > 0
														? 'semibold'
														: 'normal'
												}
											>
												{rollout.percentages[i]}%
											</Td>
										))}
									</Tr>
								))}
						</Tbody>
					</Table>
				</TableContainer>
				<canvas id='guild_rollout' ref={ref} />
			</VStack>
			{exp.overrides?.length ? (
				<VStack minW='50vw' justify='start' align='start' w='full' pt={8}>
					<Heading size='sm'>Overrides</Heading>
					<Accordion w='full' allowToggle>
						{exp.overrides.map((v, i) => (
							<AccordionItem key={i} w='full'>
								<h2>
									<AccordionButton>
										<Box as='span' flex='1' textAlign='left'>
											{getBucket(exp, v.b)?.description ?? `Treatment ${v.b}`}
										</Box>
										<AccordionIcon />
									</AccordionButton>
								</h2>
								<AccordionPanel pb={4}>
									<Code p={2} rounded='lg'>
										<pre>{v.k.join('\n')}</pre>
									</Code>
								</AccordionPanel>
							</AccordionItem>
						))}
					</Accordion>
				</VStack>
			) : null}
			{loaded ? <GuildBuckets {...exp} /> : null}
		</>
	);
};
