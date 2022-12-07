export const one = <T>(item: T): Exclude<T, any[]> =>
	Array.isArray(item) ? item[0] : item;

export const isSafari = /^((?!chrome|android).)*safari/i.test(
	globalThis?.navigator?.userAgent
);
