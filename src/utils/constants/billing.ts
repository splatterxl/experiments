export enum Products {
	PREMIUM = 1,
	MAILING_LIST
}

export const Prices: Record<Products, Record<string, string>> = {
	[Products.PREMIUM]: {
		MONTHLY: 'price_1MBmW3Eoozb1aKsto69n9Gep',
		YEARLY: 'price_1MC7JUEoozb1aKst1T0FVXE7'
	},
	[Products.MAILING_LIST]: {
		MONTHLY: 'price_1MC7GtEoozb1aKstUJIvQ6I0'
	}
};

export const PricingTables = {
	INDEX: 'prctbl_1MBmojEoozb1aKsttXYAqP9c'
};
