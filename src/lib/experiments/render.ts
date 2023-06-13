import { ExperimentRollout } from '@/lib/db/models';
import { Experiment, Filter, FilterType } from './web';
export const andList = new Intl.ListFormat();
export const orList = new Intl.ListFormat(undefined, { type: 'disjunction' });

export const parseFilter = (f: Filter) => {
	if (f[0] === FilterType.Feature)
		return `Server has feature ${orList.format(f[1][0][1])}`;
	if (f[0] === FilterType.IDRange)
		return `Server ID is in range ${f[1][0][1] ?? 0} - ${f[1][1][1]}`;
	if (f[0] === FilterType.MemberCount)
		return `Server member count is ${
			f[1][1][1]
				? `in range ${f[1][0][1] ?? 0} - ${f[1][1][1]}`
				: `${f[1][0][1]}+`
		}`;
	if (f[0] === FilterType.ID)
		return `Server ID is ${orList.format(f[1][0][1])}`;
	if (f[0] === FilterType.HubType)
		return `Server hub type is ${orList.format(
			f[1][0][1].map((t) => t.toString())
		)}`;
	if (f[0] === FilterType.VanityURL)
		return `Server ${f[1][0][1] ? 'has' : 'does not have'} vanity URL`;
	return `Unknown filter type ${f[0]}`;
};

export const parseNewFilters = (
	f: ExperimentRollout['populations'][0]['filters']
) => {
	const filters = [];

	// console.log(f);

	if (f.features) filters.push(`has features ${orList.format(f.features)}`);
	if (f.id_range)
		filters.push(`is in ID range ${f.id_range.start}..${f.id_range.end}`);
	if (f.member_count)
		filters.push(
			`member count is in range ${f.member_count.start}..${f.member_count.end}`
		);
	if (f.ids)
		filters.push(
			`is in ID list ${orList.format(f.ids.map((v) => v.toString()))}`
		);
	if (f.hub_types)
		filters.push(
			`hub type is one of ${orList.format(
				f.hub_types.map((t) => t.toString())
			)}`
		);
	if (f.vanity_url)
		filters.push(`${f.vanity_url ? 'has' : 'does not have'} vanity URL`);
	if (f.range_by_hash)
		filters.push(
			`is ranged by hash ${f.range_by_hash.hash_key} (target: ${f.range_by_hash.target})`
		);

	return !filters.length ? 'No filters' : `Server ${andList.format(filters)}`;
};

export const parseFilterShort = (f: Filter) => {
	if (f[0] === FilterType.Feature)
		return `has feature ${orList.format(f[1][0][1])}`;
	if (f[0] === FilterType.IDRange)
		return `ID is in range ${f[1][0][1] ?? 0} - ${f[1][1][1]}`;
	if (f[0] === FilterType.MemberCount)
		return `member count is ${
			f[1][1][1]
				? `in range ${f[1][0][1] ?? 0} - ${f[1][1][1]}`
				: `${f[1][0][1]}+`
		}`;
	if (f[0] === FilterType.ID) return `ID is one of \`...\``;
	if (f[0] === FilterType.HubType)
		return `hub type is ${orList.format(f[1][0][1].map((t) => t.toString()))}`;
	return `unknown`;
};

export const parsePopulations = (
	r: Experiment['rollout'][3],
	exp: Experiment
) => {
	return r.map((p) => {
		const d = parsePopulation(p[0], exp);
		const f = p[1].map(parseFilter).join('\n');

		if (!f.length) return `Default\n${d}\n`;

		return `${f}\n${d}\n`;
	});
};

export const parsePopulation = (
	p: Experiment['rollout'][3][0][0],
	exp: Experiment
) => {
	return p
		.map(
			(p) =>
				`${treatment(p[0])}: ${p[1].map((v) => `${v.s}..${v.e}`).join(', ')}`
		)
		.map((v) => ` => ${v}`)
		.join('\n');
};

export const parseOverrides = (
	o: Experiment['rollout'][4],
	exp: Experiment
) => {
	return o.map((o) => `${treatment(o.b)}\n------------\n${o.k.join('\n')}`);
};

export const treatment = (t: number) => {
	if (t === -1) return 'None';
	if (t === 0) return 'Control';
	return `Treatment ${t}`;
};

export const rolloutPercentage = (r: Experiment['rollout'][3]) => {
	const rollout = r.filter((p) => p[1].length === 0);

	let t = 0;

	for (const r of rollout) {
		const p = r[0];

		for (const [b, v] of p) {
			if (b === -1 || b === 0) continue;

			for (const p of v) {
				t += p.e - p.s;
			}
		}
	}

	const percentage = Math.trunc((t / 10_000) * 100);

	return percentage;
};

export function createRolloutsURL(id: string) {
	return `<https://rollouts.advaith.io/#${id}>`;
}
