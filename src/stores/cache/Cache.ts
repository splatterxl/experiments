import Store from '../Store';

// thank recoil for making me do this clusterfuck
export default abstract class Cache<K, V> extends Store<Map<K, V>> {
	constructor(name: string) {
		super(new Map(), name, false);
	}

	useGet() {
		const value = this.useValue();

		return (k: K) => value.get(k);
	}

	useHas() {
		const value = this.useValue();

		return (k: K) => value.has(k);
	}

	useSet() {
		const [value, set] = this.useState();

		return (k: K, v: V) => set(value.set(k, v));
	}

	useDelete() {
		const [value, set] = this.useState();

		return (k: K) => {
			value.delete(k);

			set(value);
		};
	}

	useItem(k: K) {
		const get = this.useGet();

		return get(k);
	}

	abstract fetch(k: K): Promise<V>;
}
