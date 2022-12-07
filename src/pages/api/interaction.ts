// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { webcrypto } from 'crypto';
import type {
	APIChatInputApplicationCommandInteraction,
	APIInteraction,
	APIInteractionResponse,
	InteractionResponseType,
	InteractionType
} from 'discord-api-types/v10';
import { verify } from 'discord-verify/node';
import type { NextApiRequest, NextApiResponse } from 'next';
import { view } from '../../commands/view';
import { optionsToJson } from '../../utils/interactions';

const commands: Record<string, typeof view> = { view };

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<APIInteractionResponse>
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

	switch (body.type) {
		case InteractionType.Ping:
			return res.send({ type: InteractionResponseType.Pong });
		case InteractionType.ApplicationCommand:
			body = body as APIChatInputApplicationCommandInteraction;
			if (Object.prototype.hasOwnProperty.call(commands, body.data.name)) {
				return res.send(
					commands[body.data.name]!(
						optionsToJson(body.data.options ?? []) as any,
						body
					)
				);
			}
	}
}
