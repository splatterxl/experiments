import { EmailParams, Recipient } from 'mailersend';
import { from } from './constants';

export const mailersend = new (require('mailersend'))({
	api_key: process.env.MAILER_KEY,
});

interface IRecipient {
	email: string;
	name: string;
}

interface EmailContent {
	subject: string;
	template: string;
	/**
	 * These don't work for now.
	 */
	variables?: {
		email: string;
		substitutions: Required<Record<'var' | 'value', string>>[];
	};
	attachments?: IAttachment[];
}

interface IAttachment {
	name: string;
	data: string;
}

export async function sendEmail(
	recipient: IRecipient,
	content: EmailContent
): Promise<{ status: number; json: any }> {
	const recipients = [new Recipient(recipient.email!, recipient.name)];

	const variables = [content.variables];

	const emailParams = new EmailParams()
		.setFrom(from.email)
		.setFromName(from.name)
		.setRecipients(recipients)
		.setSubject(content.subject)
		.setTemplateId(content.template)
		.setVariables(variables as any);

	return mailersend.send(emailParams).then(async (res: Response) => {
		const resp = {
			status: res.status,
			json: null as any,
			message: 'Check your email and junk folders.',
		};

		if (!res.ok) {
			resp.json = await res.json();
			resp.message = 'Could not send email';
			console.error(resp.json);
		}

		return resp;
	});
}
