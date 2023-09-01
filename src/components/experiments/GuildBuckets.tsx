import { GuildIcon } from '@/components/account/GuildIcon';
import { ExperimentRollout } from '@/lib/db/models';
import { orList } from '@/lib/experiments/render';
import { check, getBucket } from '@/lib/experiments/web';
import GuildsStore from '@/stores/GuildsStore';
import {
	Accordion,
	AccordionButton,
	AccordionIcon,
	AccordionItem,
	AccordionPanel,
	Box,
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

	const normalBuckets = (i: number) =>
		assignments.filter(
			(assignment) =>
				!assignment.overrides.length &&
				assignment.populations.length === 1 &&
				assignment.populations.some((pop) => pop.bucket === (i === 0 ? -1 : i))
		);
	const morePops = assignments.filter(
		(assignment) =>
			!assignment.overrides.length && assignment.populations.length > 1
	);
	const overrides = assignments.filter((v) => v.overrides.length > 1);

	return (
		<VStack minW='50vw' justify='start' align='start' w='full' pt={8}>
			<Heading size='sm'>My Servers</Heading>
			<Accordion w='full' allowToggle>
				{overrides.length ? (
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
								{overrides.map((assignment) => (
									<HStack
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
												{orList.format(
													assignment.overrides.map((v) => {
														const bucket = getBucket(exp, v);

														console.log(assignment, bucket);

														return bucket.description || bucket.name || v == 0
															? 'Control'
															: `Treatment ${v}`;
													})
												)}
											</Text>
										</span>
									</HStack>
								))}
							</VStack>
						</AccordionPanel>
					</AccordionItem>
				) : null}
				{exp.buckets.map((bucket, i, arr) =>
					normalBuckets(i).length ? (
						<AccordionItem w='full' key={bucket.name}>
							<h2>
								<AccordionButton>
									<Box as='span' flex='1' textAlign='left'>
										{bucket?.description ?? bucket?.name ?? `Treatment ${i}`}
									</Box>
									<AccordionIcon />
								</AccordionButton>
							</h2>
							<AccordionPanel
								pb={4}
								as={Stack}
								direction={normalBuckets(i).length > 20 ? 'row' : 'column'}
								flexWrap='wrap'
							>
								{normalBuckets(i).length === guilds.length ? (
									<i>(All your servers have this feature.)</i>
								) : (
									normalBuckets(i).map((assignment) => (
										<Stack
											direction={{ base: 'column', md: 'row' }}
											spacing={0}
											gap={{ base: 0, md: 1 }}
											pb={{ base: 4, md: 1 }}
											w={normalBuckets(i).length > 20 ? 'auto' : 'full'}
											key={assignment.guild.id}
											justify='start'
											align='center'
										>
											<GuildIcon
												id={assignment.guild.id}
												hash={assignment.guild.icon}
												name={assignment.guild.name}
												size={
													normalBuckets(i).length > 20
														? 'md'
														: ({ base: 'md', md: 'xs' } as any)
												}
											/>
											{normalBuckets(i).length < 20 ? (
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
											) : null}
										</Stack>
									))
								)}
							</AccordionPanel>
						</AccordionItem>
					) : null
				)}
				{morePops.length ? (
					<AccordionItem w='full'>
						<h2>
							<AccordionButton>
								<Box as='span' flex='1' textAlign='left'>
									Multiple Possibilities
								</Box>
								<AccordionIcon />
							</AccordionButton>
						</h2>
						<AccordionPanel
							pb={4}
							as={Stack}
							direction={morePops.length > 20 ? 'row' : 'column'}
						>
							{morePops.map((assignment) => (
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
										size={
											morePops.length > 20
												? 'md'
												: ({ base: 'md', md: 'xs' } as any)
										}
									/>
									{morePops.length > 20 ? null : (
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
																{getBucket(exp, pop.bucket)?.name ??
																	`Treatment ${pop.bucket}`}
															</Text>
														</Tooltip>
														{a.length > 1 && i !== a.length - 1 && ' or '}
													</>
												))}
											</Text>
										</span>
									)}
								</Stack>
							))}
						</AccordionPanel>
					</AccordionItem>
				) : null}
			</Accordion>
		</VStack>
	);
};
