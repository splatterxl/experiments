import { Snowflake } from 'discord-api-types/globals';
import { APIGuild } from 'discord-api-types/v10';
import type Stripe from 'stripe';
import { Products } from './constants/billing';
import { SubscriptionStatus } from './database';

export interface SubscriptionData {
	id: string;
	status: SubscriptionStatus;
	user_id: Snowflake;
	guild_id?: Snowflake | null;
	guild: APIGuild | null;
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
	payment_method?: {
		type: Stripe.PaymentMethod['type'];
		last4?: string;
	} | null;
}

export type PaymentMethod = Stripe.PaymentMethod;
