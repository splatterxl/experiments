import { authorizations, customers } from '@/lib/db/collections';
import { Redis } from '@upstash/redis';
import { Snowflake } from 'discord-api-types/globals';
import { MongoClient } from 'mongodb';

export const client = new MongoClient(process.env.MONGODB_URI!).db(
	'exps_' + process.env.NODE_ENV
);

export const redis = new Redis({
	url: process.env.UPSTASH_REDIS_REST_URL!,
	token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export function getAuth(userId: Snowflake) {
	const coll = authorizations();

	return coll.findOne({ user_id: userId });
}

export function getCustomer(userId: Snowflake) {
	const coll = customers();

	return coll.findOne({
		user_id: userId,
	});
}
