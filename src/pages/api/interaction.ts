// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { webcrypto } from 'crypto';
import type {
	APIInteraction,
	APIInteractionResponse
} from 'discord-api-types/v10';
import { verify } from 'discord-verify/node';
import type { NextApiRequest, NextApiResponse } from 'next';
import { view } from '../../commands/view';

const commands: Record<string, typeof view> = { view };

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.headers['user-agent']?.startsWith('Mozilla'))
		return res.redirect('/');

	// verify the request
	const {
		'x-signature-ed25519': signature,
		'x-signature-timestamp': timestamp
	} = req.headers;
	const rawBody = JSON.stringify(req.body);

	const isValid = await verify(
		rawBody,
		signature?.toString(),
		timestamp?.toString(),
		process.env.PUBLIC_KEY!,
		webcrypto.subtle
	);

	if (!isValid) {
		return res.status(401).send('Invalid signature' as any);
	}

	let { body }: { body: APIInteraction } = req;

	res.send('');
}
