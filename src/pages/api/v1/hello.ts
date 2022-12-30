import { ErrorCodes, Errors } from '@/lib/errors';
import { NextApiRequest, NextApiResponse } from 'next';

export default function HelloWorld(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'HEAD')
		return res.status(405).send(Errors[ErrorCodes.METHOD_NOT_ALLOWED]);

	res.send({});
}
