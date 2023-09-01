import type { getExperimentRollout } from '@/lib/experiments/web';
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
	name: string;
	description: string | null;
	no_name?: true;
	holdout?: [name: string, bucket: number];
	hash_name?: string;
}

export interface ExperimentRollout extends Experiment {
	type: 'guild';
	populations: Population[];
	overrides: Override[];
	overrides_formatted: [Population[]];
	rollout: ReturnType<typeof getExperimentRollout>;
}

export interface ExperimentAssignment extends Experiment {
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
	rollout: { s: number; e: number }[];
}

export type Filters = Partial<{
	features: string[];
	id_range: { start: bigint | null; end: bigint };
	member_count: { start: bigint | null; end: bigint };
	ids: string[];
	hub_types: number[];
	range_by_hash: { hash_key: bigint; target: number };
	vanity_url: boolean;
}>;

export interface Override {
	b: number;
	k: string[];
}

//#endregion
