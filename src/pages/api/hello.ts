import { NextApiRequest, NextApiResponse } from 'next';

export default function HelloWorld(req: NextApiRequest, res: NextApiResponse) {
	res.send({});
}
