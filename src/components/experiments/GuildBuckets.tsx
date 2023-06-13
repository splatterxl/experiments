import { GuildIcon } from '@/components/account/GuildIcon';
import { ExperimentRollout } from '@/lib/db/models';
import { orList } from '@/lib/experiments/render';
import { check } from '@/lib/experiments/web';
import GuildsStore from '@/stores/GuildsStore';
import {
	Accordion,
	AccordionButton,
	AccordionIcon,
	AccordionItem,
	AccordionPanel,
	Box,
	Divider,
	HStack,
	Heading,
	Stack,
	Text,
	Tooltip,
	VStack,
} from '@chakra-ui/react';
import { FC } from 'react';

export const GuildBuckets: FC<ExperimentRollout> = (exp) => {
	const guilds = GuildsStore.useValue();

	if (!guilds?.length) return null;

	const assignments = guilds
		.map((guild) => ({ ...check(guild.id, exp, guild as any), guild }))
		.filter((v) => v.active);

	if (!assignments.length) return null;

	return (
		<VStack minW='50vw' justify='start' align='start' w='full' pt={8}>
			<Heading size='sm'>My Servers</Heading>
			<Accordion w='full' allowToggle>
				{assignments.some((v) => v.overrides.length) ? (
					<AccordionItem w='full'>
						<h2>
							<AccordionButton>
								<Box as='span' flex='1' textAlign='left'>
									Overriden
								</Box>
								<AccordionIcon />
							</AccordionButton>
						</h2>
						<AccordionPanel pb={4}>
							<VStack>
								{assignments
									.filter((assignment) => assignment.overrides.length)
									.map((assignment) => (
										<HStack
											w='full'
											key={assignment.guild.id}
											justify='start'
											align='center'
										>
											<Heading size='sm'>{assignment.guild.name}:</Heading>
											<Text>
												{orList.format(
													assignment.overrides.map(
														(v) =>
															exp.buckets[v === -1 ? 0 : v].description ??
															exp.buckets[v === -1 ? 0 : v].name
													)
												)}
											</Text>
										</HStack>
									))}
							</VStack>
						</AccordionPanel>
					</AccordionItem>
				) : null}
				{exp.buckets.map((bucket, i) =>
					assignments.some(
						(assignment) =>
							!assignment.overrides.length &&
							assignment.populations.length === 1 &&
							assignment.populations.some(
								(pop) => pop.bucket === (i === 0 ? -1 : i)
							)
					) ? (
						<AccordionItem w='full' key={bucket.name}>
							<h2>
								<AccordionButton>
									<Box as='span' flex='1' textAlign='left'>
										{bucket.description}
									</Box>
									<AccordionIcon />
								</AccordionButton>
							</h2>
							<AccordionPanel pb={4}>
								{assignments
									.filter(
										(assignment) =>
											!assignment.overrides.length &&
											assignment.populations.length === 1 &&
											assignment.populations.some(
												(pop) => pop.bucket === (i === 0 ? -1 : i)
											)
									)
									.map((assignment) => (
										<Stack
											direction={{ base: 'column', md: 'row' }}
											spacing={0}
											gap={{ base: 0, md: 1 }}
											pb={{ base: 4, md: 1 }}
											w='full'
											key={assignment.guild.id}
											justify='start'
											align='center'
										>
											<GuildIcon
												id={assignment.guild.id}
												hash={assignment.guild.icon}
												name={assignment.guild.name}
												size={{ base: 'md', md: 'xs' } as any}
											/>
											<span>
												<Heading
													size='sm'
													display='inline'
													pl={{ base: 0, md: 1 }}
													pt={1}
													as='span'
												>
													{assignment.guild.name}:
												</Heading>{' '}
												<Text
													maxW='60vw'
													display='inline'
													pb={0}
													pt={1}
													textAlign='center'
													as='span'
												>
													{assignment.populations.length > 1 ? (
														<></>
													) : (
														assignment.populations[0].name
													)}
												</Text>
											</span>
										</Stack>
									))}
							</AccordionPanel>
						</AccordionItem>
					) : null
				)}
				{assignments.some(
					(assignment) =>
						!assignment.overrides.length && assignment.populations.length > 1
				) ? (
					<AccordionItem w='full'>
						<h2>
							<AccordionButton>
								<Box as='span' flex='1' textAlign='left'>
									Multiple Possibilities
								</Box>
								<AccordionIcon />
							</AccordionButton>
						</h2>
						<AccordionPanel pb={4}>
							{assignments
								.filter(
									(assignment) =>
										!assignment.overrides.length &&
										assignment.populations.length > 1
								)
								.map((assignment) => (
									<Stack
										direction={{ base: 'column', md: 'row' }}
										spacing={0}
										gap={{ base: 0, md: 1 }}
										pb={{ base: 4, md: 1 }}
										w='full'
										key={assignment.guild.id}
										justify='start'
										align='center'
									>
										<GuildIcon
											id={assignment.guild.id}
											hash={assignment.guild.icon}
											name={assignment.guild.name}
											size={{ base: 'md', md: 'xs' } as any}
										/>
										<span>
											<Heading
												size='sm'
												display='inline'
												pl={{ base: 0, md: 1 }}
												pt={1}
												as='span'
											>
												{assignment.guild.name}:
											</Heading>{' '}
											<Text
												maxW='60vw'
												display='inline'
												pb={0}
												pt={1}
												textAlign='center'
												as='span'
											>
												{assignment.populations.map((pop, i, a) => (
													<>
														<Tooltip
															key={pop.bucket}
															label={pop.name}
															placement='top'
															cursor='cursor'
														>
															<Text
																as='span'
																cursor='pointer'
																textDecoration='underline'
																textUnderlineOffset={3}
																textDecorationColor='whiteAlpha.500'
															>
																{
																	exp.buckets[
																		pop.bucket === -1 ? 0 : pop.bucket
																	]?.name
																}
															</Text>
														</Tooltip>
														{a.length > 1 && i !== a.length - 1 && ' or '}
													</>
												))}
											</Text>
										</span>
									</Stack>
								))}
						</AccordionPanel>
					</AccordionItem>
				) : null}
			</Accordion>
		</VStack>
	);
};
