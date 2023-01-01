import { Snowflake } from 'discord-api-types/globals';
import type Stripe from 'stripe';
import { SubscriptionStatus } from '../db/models';
import { Products } from './constants';

export interface SubscriptionData {
	id: string;
	status: SubscriptionStatus;
	user_id: Snowflake;
	guild_id?: Snowflake | null;
	product: {
		id: string;
		label: string;
		type: Products;
	};
	currency: string;
	price: number | null;
	trial_ends_at: number | null;
	cancels_at: number | null;
	cancelled: boolean;
	renews_at: number | null;
	payment_method?: PaymentMethod | null;
}

export interface PaymentMethod {
	id: string;
	default: boolean;
	type: Stripe.PaymentMethod.Type;
	email: string | null;
	exp: string | null;
	brand: string | null;
	last4: string | null;
	wallet: Stripe.PaymentMethod.Card.Wallet | null;
	eps: Stripe.PaymentMethod.Eps.Bank | null;
	ideal: Stripe.PaymentMethod.Ideal.Bank | null;
}
