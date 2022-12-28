import {
	atom,
	RecoilState,
	SetterOrUpdater,
	useRecoilState,
	useRecoilValue,
	useSetRecoilState,
} from 'recoil';

/* eslint-disable */

export default class Store<T, D = T> {
	_atom: RecoilState<T | D>;

	constructor(
		private defaultValue: D = null as unknown as D,
		public key: string,
		public persisted = false
	) {
		let initialValue = defaultValue;

		if (persisted && typeof window !== 'undefined') {
			const val = localStorage.getItem(key);

			if (val == null) {
				localStorage.removeItem(key);
			} else {
				initialValue = JSON.parse(val);
			}
		}

		this._atom = atom<T | D>({
			key,
			default: initialValue,
		});
	}

	useValue() {
		const value = useRecoilValue(this._atom);

		return value;
	}

	useSetState() {
		const fn = useSetRecoilState(this._atom);

		return fn;
	}

	useState() {
		const state = useRecoilState(this._atom);

		return state;
	}

	useGetFromStorage() {
		const setState = this.useSetState();

		return () => this._getFromStorage(setState);
	}

	_getFromStorage(setState: SetterOrUpdater<D | T>): D | T {
		let value: any = localStorage.getItem(this.key);

		if (value != null) value = JSON.parse(value);
		else value = this.defaultValue;

		setState(value);

		return value;
	}

	useSetInStorage() {
		const setState = this.useSetState();

		return (value: D | T) => {
			if (value == null) localStorage.removeItem(this.key);
			else localStorage.setItem(this.key, JSON.stringify(value));

			setState(value);
		};
	}

	useStateFromStorage(): [() => D | T, (value: D | T) => void, D | T] {
		const get = this.useGetFromStorage(),
			set = this.useSetInStorage();

		return [get, set, this.useValue()];
	}
}
