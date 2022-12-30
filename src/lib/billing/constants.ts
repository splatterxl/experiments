import { IconProps } from '@chakra-ui/react';
import Stripe from 'stripe';
import { ApplePayIcon } from '../../components/brand/icons/ApplePayIcon';
import { BancontactIcon } from '../../components/brand/icons/BancontactIcon';
import { CardIcon } from '../../components/brand/icons/CardIcon';
import { EpsIcon } from '../../components/brand/icons/EpsIcon';
import { GiropayIcon } from '../../components/brand/icons/GiropayIcon';
import { GooglePayIcon } from '../../components/brand/icons/GooglePayIcon';
import { IdealIcon } from '../../components/brand/icons/IdealIcon';
import { KlarnaIcon } from '../../components/brand/icons/KlarnaIcon';
import { LinkIcon } from '../../components/brand/icons/LinkIcon';

export enum Products {
	PREMIUM = 1,
	MAILING_LIST,
}

export const ProductLabels: Record<Products, string> = {
	[Products.MAILING_LIST]: 'Mailing List',
	[Products.PREMIUM]: 'Premium',
};

export const Prices: Record<Products, Record<string, string>> = {
	[Products.PREMIUM]: {
		MONTHLY: 'price_1MBmW3Eoozb1aKsto69n9Gep',
		YEARLY: 'price_1MC7JUEoozb1aKst1T0FVXE7',
	},
	[Products.MAILING_LIST]: {
		MONTHLY: 'price_1MC7GtEoozb1aKstUJIvQ6I0',
	},
};

export const PriceData = {
	price_1MBmW3Eoozb1aKsto69n9Gep: {
		price: 500,
		cycle: 'month',
	},
	price_1MC7JUEoozb1aKst1T0FVXE7: {
		price: 5000,
		cycle: 'year',
	},
	price_1MC7GtEoozb1aKstUJIvQ6I0: {
		price: 100,
		cycle: 'month',
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

export const PaymentMethodIcons: Partial<
	Record<Stripe.PaymentMethod.Type, React.ComponentType<IconProps>>
> = {
	bancontact: BancontactIcon,
	eps: EpsIcon,
	giropay: GiropayIcon,
	ideal: IdealIcon,
	klarna: KlarnaIcon,
	link: LinkIcon,
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
	React.ComponentType<IconProps> | string
> = {
	amex_express_checkout: '/assets/card/amex.svg',
	apple_pay: ApplePayIcon,
	google_pay: GooglePayIcon,
	masterpass: '/assets/card/mastercard.svg',
	samsung_pay: CardIcon,
	visa_checkout: '/assets/card/visa.svg',
};

export const IdealBanks: Record<Stripe.PaymentMethod.Ideal.Bank, string> = {
	abn_amro: 'ABN Amro',
	asn_bank: 'ASN Bank',
	bunq: 'bunq B.V.',
	handelsbanken: 'Handelsbanken',
	ing: 'ING Bank',
	knab: 'Knab',
	moneyou: 'Moneyou',
	rabobank: 'Rabobank',
	regiobank: 'RegioBank',
	revolut: 'Revolut',
	sns_bank: 'SNS Bank',
	triodos_bank: 'Triodos Bank',
	van_lanschot: 'Van Lanschot',
};

export const EpsBanks: Record<Stripe.PaymentMethod.Eps.Bank, string> = {
	arzte_und_apotheker_bank: 'Ärzte- und Apotheker Bank',
	austrian_anadi_bank_ag: 'Austrian Anadi Bank AG',
	bank_austria: 'Bank Austria',
	bankhaus_carl_spangler: 'Bankhaus Carl Spängler & Co. AG',
	bankhaus_schelhammer_und_schattera_ag: 'Bankhaus Schelhammer & Schattera AG',
	bawag_psk_ag: 'BAWAG P.S.K. AG',
	bks_bank_ag: 'BKS Bank AG',
	brull_kallmus_bank_ag: 'Brüll Kallmus Bank AG',
	btv_vier_lander_bank: 'BTV VIER LÄNDER BANK',
	capital_bank_grawe_gruppe_ag: 'Capital Bank Grawe Gruppe AG',
	deutsche_bank_ag: 'Deutsche Bank AG',
	dolomitenbank: 'Dolomitenbank',
	easybank_ag: 'Easybank AG',
	erste_bank_und_sparkassen: 'Erste Bank und Sparkassen',
	hypo_alpeadriabank_international_ag: 'Hypo Alpe-Adria-Bank International AG',
	hypo_bank_burgenland_aktiengesellschaft: 'HYPO-BANK BURGENLAND AG',
	hypo_noe_lb_fur_niederosterreich_u_wien:
		'HYPO NOE LB für Niederösterreich u. Wien',
	hypo_oberosterreich_salzburg_steiermark:
		'HYPO Oberösterreich,Salzburg,Steiermark',
	hypo_tirol_bank_ag: 'Hypo Tirol Bank AG',
	hypo_vorarlberg_bank_ag: 'Hypo Vorarlberg Bank AG',
	marchfelder_bank: 'Marchfelder Bank',
	oberbank_ag: 'Oberbank AG',
	raiffeisen_bankengruppe_osterreich: 'Raiffeisen Bankengruppe Österreich',
	schoellerbank_ag: 'Schöllerbank AG',
	sparda_bank_wien: 'Sparda-Bank Wien',
	volksbank_gruppe: 'Volksbank Gruppe',
	volkskreditbank_ag: 'Volkskreditbank AG',
	vr_bank_braunau: 'VR Bank Braunau',
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
