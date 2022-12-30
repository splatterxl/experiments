export const one = <T>(item: T): Exclude<T, any[]> =>
	Array.isArray(item) ? item[0] : item;

export const isSafari = /^((?!chrome|android).)*safari/i.test(
	globalThis?.navigator?.userAgent
);

export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

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
