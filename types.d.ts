type localeMatcher = 'lookup' | 'best fit';

declare namespace Intl {
	/** https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/ListFormat */
	class ListFormat {
		public constructor(
			locales?: string | string[],
			options?: {
				localeMatcher?: localeMatcher;
				type?: 'conjunction' | 'disjunction' | 'unit';
				style?: 'long' | 'short';
			}
		);
		public static supportedLocalesOf(
			locales: string | string[],
			options?: { localeMatcher: localeMatcher }
		): string[];
		public format: (items: Iterable<any>) => string;
		public formatToParts: (
			list: string[]
		) => { type: 'element' | 'literal'; value: string }[];
	}
}

declare module 'mailersend' {
	export class Recipient {
		constructor(email: string, name?: string);
	}

	export class Attachment {
		constructor(data: string, filename: string, type: 'attachment');
	}

	export class EmailParams {
		constructor();

		setFrom(email: string): EmailParams;
		setFromName(name: string): EmailParams;
		setRecipients(recipients: Recipient[]): EmailParams;
		setSubject(subject: string): EmailParams;
		setTemplateId(id: string): EmailParams;
		setVariables(variables: {
			email: string;
			substitutions: Required<Record<'var' | 'value', string>>[];
		}): EmailParams;
		setAttachments(attachments: Attachment[]): EmailParams;
	}
}
