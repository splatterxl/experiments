import { ErrorCodes, Errors } from '@/lib/errors';
import { one } from '@/utils';
import {
	BaseError,
	CombinedError,
	ExpectedConstraintError,
	ExpectedValidationError,
	InferType,
	MissingPropertyError,
	ObjectValidator,
} from '@sapphire/shapeshift';
import { NextApiRequest, NextApiResponse } from 'next';

export default function handle<T extends ObjectValidator<any, any>>(
	req: NextApiRequest,
	res: NextApiResponse,
	schema: T
): InferType<T> | undefined {
	if (req.headers['content-type'] !== 'application/json') {
		res.status(415).send('You must send this endpoint a JSON body');
		return;
	}

	const validator = schema;

	try {
		let body = req.body;

		validator.parse(body);

		return body;
	} catch (e) {
		const error = e as BaseError;

		res
			.status(400)
			.send(prettifyError(error, Boolean(one(req.query.full_errors))));
		return;
	}
}

function prettifyError(err: any, full_errors: boolean): any {
	if (full_errors) return err;

	const errors: Record<PropertyKey, any> = {};

	if (err.errors) {
		if (Array.isArray(err.errors[0])) {
			for (const [key, error] of err.errors as [PropertyKey, CombinedError][]) {
				errors[key] =
					(!Array.isArray(error.errors) ? [error] : error.errors)
						.map((v: any) => {
							switch (true) {
								case v instanceof ExpectedConstraintError:
									switch (v.constraint) {
										case 's.string.regex':
											return `Must match provided validation regex ${
												v.expected.match(/expected (\/.*\/)\.test/)?.[1] ?? ''
											}`;

										default:
											return `${v.expected}`;
									}

								case v instanceof MissingPropertyError: {
									return `This property is required.`;
								}

								case v instanceof ExpectedValidationError: {
									switch (v.validator) {
										case 's.literal(V)':
											if (v.expected == null) return null;
											return `Expected a literal value ${v.expected}`;
									}
								}

								default: {
									return `${v.constructor.name}${
										v.message ? `: ${v.message}` : ''
									}`;
								}
							}
						})
						.filter((v: any) => v !== null) ?? error;
			}

			return errors;
		} else return err;
	} else {
		return Errors[ErrorCodes.INVALID_FORM_BODY](undefined);
	}
}
