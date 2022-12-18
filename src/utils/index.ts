export const one = <T>(item: T): Exclude<T, any[]> =>
	Array.isArray(item) ? item[0] : item;

export const isSafari = /^((?!chrome|android).)*safari/i.test(
	globalThis?.navigator?.userAgent
);

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
