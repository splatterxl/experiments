import { db } from '@/lib/db';
import {
	authorizations,
	customers,
	experiments,
	subscriptions,
} from '@/lib/db/collections';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function Diagnostics(
	req: NextApiRequest,
	res: NextApiResponse
) {
	res.send({
		environment: process.env.NODE_ENV,
		uptime: process.uptime(),
		memory:
			process.env.NODE_ENV === 'development' ? process.memoryUsage() : null,
		nodeVersion: process.version,
		os: {
			platform: process.platform,
			arch: process.arch,
		},
		stats: {
			users: await authorizations().countDocuments(),
			experiments: await experiments().countDocuments(),
			subscriptions: await subscriptions().countDocuments(),
			customers: await customers().countDocuments(),
			logs: await db.db('logs').collection('log-collection').countDocuments(),
		},
	});
}
