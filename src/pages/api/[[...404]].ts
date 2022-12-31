import { ErrorCodes, Errors } from '@/lib/errors';
import { NextApiRequest, NextApiResponse } from 'next';

export default function NotFound(req: NextApiRequest, res: NextApiResponse) {
	res.send(Errors[ErrorCodes.NOT_FOUND]);
}
