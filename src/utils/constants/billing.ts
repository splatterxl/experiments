import Stripe from 'stripe';
import { ApplePayIcon } from '../../components/brand/icons/ApplePayIcon';
import { CardIcon } from '../../components/brand/icons/CardIcon';
import { GooglePayIcon } from '../../components/brand/icons/GooglePayIcon';

export enum Products {
	PREMIUM = 1,
	MAILING_LIST,
}

export const Prices: Record<Products, Record<string, string>> = {
	[Products.PREMIUM]: {
		MONTHLY: 'price_1MBmW3Eoozb1aKsto69n9Gep',
		YEARLY: 'price_1MC7JUEoozb1aKst1T0FVXE7',
	},
	[Products.MAILING_LIST]: {
		MONTHLY: 'price_1MC7GtEoozb1aKstUJIvQ6I0',
	},
};

export const PricingTables = {
	INDEX: 'prctbl_1MBmojEoozb1aKsttXYAqP9c',
};

export const Months = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'Jun',
	'Jul',
	'Aug',
	'Sep',
	'Oct',
	'Nov',
	'Dec',
];

export const PaymentMethods: Record<Stripe.PaymentMethod['type'], string> = {
	acss_debit: 'ACSS Debit',
	affirm: 'Affirm',
	afterpay_clearpay: 'Afterpay/Clearpay',
	alipay: 'Alipay',
	au_becs_debit: 'BECS Direct Debit',
	bacs_debit: 'Bacs Direct Debit',
	bancontact: 'Bancontact',
	blik: 'BLIK',
	boleto: 'Boleto',
	card: 'Card',
	card_present: 'Stripe Terminal',
	customer_balance: 'Balance',
	eps: 'EPS',
	fpx: 'FPX',
	giropay: 'giropay',
	grabpay: 'GrabPay',
	ideal: 'iDEAL',
	interac_present: 'Stripe Terminal with Interac',
	klarna: 'Klarna',
	konbini: 'Konbini',
	link: 'Link',
	oxxo: 'OXXO',
	p24: 'Przelewy24',
	paynow: 'PayNow',
	pix: 'Pix',
	promptpay: 'PromptPay',
	sepa_debit: 'SEPA Direct Debit',
	sofort: 'Sofort',
	us_bank_account: 'ACH Direct Debit',
	wechat_pay: 'WeChat Pay',
};

export const Wallets: Record<Stripe.PaymentMethod.Card.Wallet.Type, string> = {
	amex_express_checkout: 'American Express Express Checkout',
	apple_pay: 'Apple Pay',
	google_pay: 'Google Pay',
	masterpass: 'Masterpass',
	samsung_pay: 'Samsung Pay',
	visa_checkout: 'Visa Checkout',
};

export const WalletIcons: Record<
	Stripe.PaymentMethod.Card.Wallet.Type,
	React.ComponentType<{ boxSize: string }> | string
> = {
	amex_express_checkout: '/assets/card/amex.svg',
	apple_pay: ApplePayIcon,
	google_pay: GooglePayIcon,
	masterpass: '/assets/card/mastercard.svg',
	samsung_pay: CardIcon,
	visa_checkout: '/assets/card/visa.svg',
};

export const IdealBanks: Record<Stripe.PaymentMethod.Ideal.Bank, string> = {
	abn_amro: 'ABN AMRO',
	asn_bank: 'ASN Bank',
	bunq: 'bunq',
	handelsbanken: 'Handelsbanken',
	ing: 'ING',
	knab: 'Knab',
	moneyou: 'Moneyou',
	rabobank: 'Rabobank',
	regiobank: 'RegioBank',
	revolut: 'Revolut',
	sns_bank: 'SNS Bank',
	triodos_bank: 'Triodos Bank',
	van_lanschot: 'Van Lanschot',
};

export const CardBrands: Record<string, string> = {
	diners: 'Diners Club',
	discover: 'Discover',
	jcb: 'JCB',
	mastercard: 'MasterCard',
	unionpay: 'UnionPay',
	visa: 'Visa',
	unknown: 'Unknown',
};
