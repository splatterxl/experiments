import { Snowflake } from 'discord-api-types/globals';
import { client } from '.';
import { Authorization, Experiment, Subscription } from './models';

export const subscriptions = () =>
	client.collection<Subscription>('subscriptions');

export const authorizations = () => client.collection<Authorization>('auth');

export const customers = () =>
	client.collection<{ user_id: Snowflake; customer_id: string }>('customers');

export const experiments = () => client.collection<Experiment>('experiments');
