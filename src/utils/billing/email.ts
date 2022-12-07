import { EmailParams, Recipient } from 'mailersend';

export const mailer = new (require('mailersend'))({
	api_key: process.env.MAILER_KEY
});

const from = {
	email: 'noreply@splt.dev',
	name: 'Splatterxl'
};

interface IRecipient {
	email: string;
	name: string;
}

interface EmailContent {
	subject: string;
	template: string;
	variables: Record<string, string>;
}

export function sendEmail(recipient: IRecipient, content: EmailContent) {
	const recipients = [new Recipient(recipient.email, recipient.name)];

	const params = new EmailParams()
		.setFrom(from.email)
		.setFromName(from.name)
		.setRecipients(recipients)
		.setSubject(content.subject)
		.setTemplateId(content.template)
		.setPersonalization({ email: recipient.email, data: content.variables });

	return mailer.send(params);
}
