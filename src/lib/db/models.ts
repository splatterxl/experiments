import { Snowflake } from 'discord-api-types/globals';
import { Products } from '../billing/constants';

export interface Subscription {
	user_id: Snowflake;
	session_id: string;
	customer_id: string;
	subscription_id: string;
	guild_id?: string | null;
	product: Products;
	status: SubscriptionStatus;
}

export enum SubscriptionStatus {
	ACTIVE,
	CANCELLED,
	FAILED,
}

export interface Authorization {
	access_token: string;
	refresh_token: string;
	expires: Date;
	token_type: string;
	scope: string[];
	user_id: Snowflake;
}

export interface Customer {
	user_id: Snowflake;
	customer_id: string;
}

//#region Experiments

export interface Experiment {
	type: 'user' | 'guild';
	title: string;
	buckets: { name: string; description: string | null }[];
	id: string;
	hash_key: number;
}

export interface ExperimentRollout {
	type: 'guild';
	populations: Population[];
	overrides: Override[];
	overrides_formatted: [Population[]];
}

export interface ExperimentAssignment {
	type: 'user';
	has_assignments: boolean;
	assignments?: Record<`${number}`, number>;
}

export interface Population {
	rollout: Rollout[];
	filters: Filters;
}

export interface Rollout {
	bucket: number;
	rollout: Rollout[];
}

export interface Filters {
	features: string[] | null;
	id_range: { start: bigint | null; end: bigint } | null;
	member_count: { start: bigint | null; end: bigint | null } | null;
	ids: bigint[] | null;
	hub_types: number[] | null;
	range_by_hash: { hash_key: bigint; target: number } | null;
}

export interface Override {
	b: number;
	k: bigint[];
}

//#endregion
