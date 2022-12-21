import { Attachment, EmailParams, Recipient } from 'mailersend';

export const mailersend = new (require('mailersend'))({
	api_key: process.env.MAILER_KEY
});

export const from = {
	email: 'noreply@splt.dev',
	name: 'Experiments'
};

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

export function sendEmail(recipient: IRecipient, content: EmailContent) {
	const recipients = [new Recipient(recipient.email, recipient.name)];

	let params = new EmailParams()
		.setFrom(from.email)
		.setFromName(from.name)
		.setRecipients(recipients)
		.setSubject(content.subject)
		.setTemplateId(content.template)
		.setVariables(content.variables as any);

	if (content.attachments) {
		params = params.setAttachments(
			content.attachments.map(
				(v) => new Attachment(v.data, v.name, 'attachment')
			)
		);
	}

	// FIXME: we can't use personalisation for some reason??
	// .setPersonalization({
	// 	data: content.variables,
	// 	email: recipient.email
	// });

	return mailersend.send(params).then(async (res: Response) => {
		const resp = {
			status: `${res.status} ${res.statusText}`,
			json: null as any
		};

		if (!res.ok) {
			resp.json = await res.json();
			console.error(resp.json);
		}

		return resp;
	});
}
