import { Redis } from '@upstash/redis';
import { Snowflake } from 'discord-api-types/globals';
import { APIUser } from 'discord-api-types/v10';
import { verify } from 'jsonwebtoken';
import { MongoClient } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';
import { destroyCookie } from 'nookies';
import { Products } from './constants/billing';
import { Endpoints, makeDiscordURL } from './constants/discord';
import { JWT_TOKEN } from './jwt';

export const client = new MongoClient(process.env.MONGODB_URI!).db(
	'exps_' + process.env.NODE_ENV
);

export const redis = new Redis({
	url: process.env.UPSTASH_REDIS_REST_URL!,
	token: process.env.UPSTASH_REDIS_REST_TOKEN!
});

export interface Subscription {
	user_id: Snowflake;
	session_id: string;
	customer_id: string;
	subscription_id: string;
	guild_id?: string | null;
	product: Products;
}

export function getAuth(userId: Snowflake) {
	const coll = client.collection('auth');

	return coll.findOne({ user_id: userId });
}

export const checkAuth = async (
	req: NextApiRequest,
	res: NextApiResponse
): Promise<(APIUser & { access_token: string }) | undefined> => {
	if (!req.cookies.auth) {
		res
			.status(401)
			.send({ message: 'Please login before attempting this action.' });
	} else {
		try {
			const { id } = verify(req.cookies.auth, JWT_TOKEN) as APIUser;

			const auth = await getAuth(id);

			if (!auth) throw new Error('valid authentication token, no stored data');

			const discord = await fetch(makeDiscordURL(Endpoints.ME, {}), {
				headers: { Authorization: `${auth.token_type} ${auth.access_token}` }
			});

			if (discord.status !== 200) {
				logout(res);
			} else {
				return { ...(await discord.json()), access_token: auth.access_token };
			}
		} catch (err) {
			console.error(err);

			try {
				logout(res);
			} catch {
				// there's a chance the response will already have been sent
			}
		}
	}
};

function logout(res: NextApiResponse) {
	destroyCookie({ res }, 'auth');
	destroyCookie({ res }, 'refresh');

	// TODO: implement refreshing

	res.status(401).send({
		message: 'Authentication token expired, please log in again.'
	});
}
