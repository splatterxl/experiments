import { Redis } from '@upstash/redis';
import { Snowflake } from 'discord-api-types/globals';
import { APIUser } from 'discord-api-types/v10';
import { sign, verify } from 'jsonwebtoken';
import { MongoClient } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';
import { destroyCookie, setCookie } from 'nookies';
import { Products } from './constants/billing';
import { Endpoints, makeDiscordURL } from './constants/discord';
import { JWT_TOKEN } from './jwt';
import { getLogger } from './logger';

export const client = new MongoClient(process.env.MONGODB_URI!).db(
	'exps_' + process.env.NODE_ENV
);

export const redis = new Redis({
	url: process.env.UPSTASH_REDIS_REST_URL!,
	token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

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

export function getAuth(userId: Snowflake) {
	const coll = client.collection<Authorization>('auth');

	return coll.findOne({ user_id: userId });
}

export const checkAuth = async (
	req: NextApiRequest,
	res: NextApiResponse
): Promise<
	| (APIUser & { access_token: string; logger: import('pino').Logger })
	| undefined
> => {
	if (!req.cookies.auth) {
		res
			.status(401)
			.send({ message: 'Please login before attempting this action.' });
	} else {
		const logger = getLogger(req);

		try {
			const { id } = verify(req.cookies.auth, JWT_TOKEN) as APIUser;

			const auth = await getAuth(id);

			if (!auth) {
				await logout(res);

				return;
			}

			const discord = await fetch(makeDiscordURL(Endpoints.ME, {}), {
				headers: { Authorization: `${auth.token_type} ${auth.access_token}` },
			});

			if (discord.status !== 200) {
				await logout(res);
			} else {
				const json = await discord.json();

				setCookie({ res }, 'auth', sign(json, JWT_TOKEN), { path: '/' });

				return {
					...json,
					access_token: auth.access_token,
					logger: logger.child({
						user: { id, email: json.email },
						auth: {
							token_type: auth.token_type,
							scopes: auth.scope,
							access_token: auth.access_token,
						},
					}),
				};
			}
		} catch (err: any) {
			console.error(err);

			logger.error(
				{ error: err.toString() },
				'Could not verify authentication'
			);

			try {
				await logout(res);
			} catch {
				// there's a chance the response will already have been sent
			}
		}
	}
};

async function logout(res: NextApiResponse, id?: Snowflake) {
	destroyCookie({ res }, 'auth', { path: '/' });
	destroyCookie({ res }, 'refresh', { path: '/' });

	// TODO: implement refreshing

	if (id)
		await client.collection<Authorization>('auth').deleteMany({ user_id: id });

	res.status(401).send({
		message: 'Authentication token expired, please log in again.',
	});
}
