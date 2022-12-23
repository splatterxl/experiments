export const one = <T>(item: T): Exclude<T, any[]> =>
	Array.isArray(item) ? item[0] : item;

export const isSafari = /^((?!chrome|android).)*safari/i.test(
	globalThis?.navigator?.userAgent
);

export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

export interface PaginationOptions {
	limit?: number;
	cursor?: number;
}

export interface Pagination<T> {
	hits: number;
	position: { start: number; end: number; remaining: number } | null;
	results: T[];
}

export function paginate<T>(
	result: T[],
	options: PaginationOptions
): Pagination<T> {
	let { limit, cursor } = options;

	limit = parseInt(limit?.toString() ?? '50');

	if (isNaN(limit) || limit > 200) throw new TypeError('Invalid limit');

	cursor = parseInt(cursor?.toString() ?? '0');

	if (isNaN(cursor) || (result.length && cursor >= result.length))
		throw new TypeError('Invalid cursor');

	const sliced = result.slice(cursor, cursor + limit);

	return {
		hits: result.length,
		position:
			sliced.length !== result.length
				? {
						start: cursor,
						end: sliced.length + cursor,
						remaining: result.length - (sliced.length + cursor)
				  }
				: null,
		results: sliced
	};
}

export const random = (min: number, max: number) =>
	Math.floor(Math.random() * (max - min)) + min;

export const range = (start: number, end: number, step = 1) => {
	let output = [];
	if (typeof end === 'undefined') {
		end = start;
		start = 0;
	}
	for (let i = start; i < end; i += step) {
		output.push(i);
	}
	return output;
};
