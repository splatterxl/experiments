class APIError {
	#baggage: any;

	constructor(
		public message: string,
		public code: ErrorCodes = ErrorCodes.UNKNOWN,
		baggage?: any
	) {
		this.#baggage = baggage ?? {};
	}

	toJSON() {
		return {
			message: this.message,
			code: this.code,
			...this.#baggage,
		};
	}
}

export { APIError as Error };

export enum ErrorCodes {
	// auth
	LOGIN = 1e3,
	AUTH_EXPIRED,
	MISSING_ACCESS,

	// discord auth
	INVALID_SCOPE = 11e2,
	GUILDS_REQUIRED,
	EMAIL_REQUIRED,
	ANTI_SPAM_CHECK_FAILED,

	// validation
	INVALID_REQUEST_BODY = 2e3,
	INVALID_HOST,
	INVALID_SIGNATURE,
	INVALID_PAYMENT_METHOD_ID,
	INVALID_SUBSCRIPTION_ID,
	INVALID_GUILD_ID,
	INVALID_PRODUCT,
	INVALID_PRICE,
	INVALID_TRIAL,
	INVALID_SESSION,
	INVALID_FORM_BODY,

	// unknown entities
	UNKNOWN_HARVEST = 3e3,
	UNKNOWN_PAYMENT_METHOD,
	UNKNOWN_SUBSCRIPTION,
	UNKNOWN_SESSION,

	// rate limits
	USER_LIMIT = 4e3,
	RESOURCE_LIMIT,
	IP_LIMIT,
	HARVEST_ALREADY_IN_PROGRESS,

	// billing
	CUSTOMER_DELETED = 5e3,
	UPDATE_CANCELLED_SUB,
	USER_NOT_ADMIN,
	SUBSCRIPTION_ALREADY_APPLIED,
	REINSTATE_FAILED_SUB,
	COMPLETE_UNPAID,

	// max entities
	MAX_SUBSCRIPTIONS = 6e3,

	// misc
	FRAUD = 11e3,
	FEATURE_DISABLED,

	// http
	NOT_FOUND = 404,
	METHOD_NOT_ALLOWED = 405,
	UNPROCESSABLE_ENTITY = 422,
	BAD_GATEWAY = 502,
	INTERNAL_SERVER_ERROR = 500,

	UNKNOWN = 0,
}

export const Errors = {
	[ErrorCodes.LOGIN]: new APIError(
		'Please log in before attempting this action',
		ErrorCodes.LOGIN
	),
	[ErrorCodes.AUTH_EXPIRED]: new APIError(
		'Authentication token expired. Please log in again.',
		ErrorCodes.AUTH_EXPIRED
	),
	[ErrorCodes.MISSING_ACCESS]: new APIError(
		'Missing access',
		ErrorCodes.MISSING_ACCESS
	),

	[ErrorCodes.INVALID_SCOPE]: new APIError(
		'Invalid scope',
		ErrorCodes.INVALID_SCOPE
	),
	[ErrorCodes.GUILDS_REQUIRED]: new APIError(
		'To prevent spam and fraud across our services, we ask for read-only access to your servers list. We will \
    never share or view this data. Consult our privacy policy for more information: https://exps.splt.dev/privacy',
		ErrorCodes.INVALID_SCOPE
	),
	[ErrorCodes.EMAIL_REQUIRED]: new APIError(
		'We require read-only access to your email address to send you important updates about your account and payments, \
    and to provide our Mailing List services. We will never send you promotional content without consent. Consult our privacy \
    policy for more information: https://exps.splt.dev/privacy',
		ErrorCodes.INVALID_SCOPE
	),
	[ErrorCodes.ANTI_SPAM_CHECK_FAILED]: new APIError(
		'To prevent spam across our services, we require accounts to be legitimate to sign in.',
		ErrorCodes.ANTI_SPAM_CHECK_FAILED
	),

	[ErrorCodes.INVALID_REQUEST_BODY]: new APIError(
		'Invalid request body. Must be application/json',
		ErrorCodes.INVALID_REQUEST_BODY
	),
	[ErrorCodes.INVALID_HOST]: new APIError(
		'Invalid host',
		ErrorCodes.INVALID_HOST
	),
	[ErrorCodes.INVALID_SIGNATURE]: new APIError(
		'Invalid signature',
		ErrorCodes.INVALID_SIGNATURE
	),
	[ErrorCodes.INVALID_PAYMENT_METHOD_ID]: new APIError(
		'Invalid payment method ID',
		ErrorCodes.INVALID_PAYMENT_METHOD_ID
	),
	[ErrorCodes.INVALID_SUBSCRIPTION_ID]: new APIError(
		'Invalid subscription ID',
		ErrorCodes.INVALID_SUBSCRIPTION_ID
	),
	[ErrorCodes.INVALID_GUILD_ID]: new APIError(
		'Invalid guild ID',
		ErrorCodes.INVALID_SUBSCRIPTION_ID
	),
	[ErrorCodes.INVALID_PRODUCT]: new APIError(
		'Invalid product',
		ErrorCodes.INVALID_PRODUCT
	),
	[ErrorCodes.INVALID_PRICE]: new APIError(
		'Invalid price',
		ErrorCodes.INVALID_PRICE
	),
	[ErrorCodes.INVALID_TRIAL]: new APIError(
		'Invalid trial',
		ErrorCodes.INVALID_TRIAL
	),
	[ErrorCodes.INVALID_SESSION]: new APIError(
		'Invalid checkout session',
		ErrorCodes.INVALID_SESSION
	),
	[ErrorCodes.INVALID_FORM_BODY]: (errors: any) =>
		new APIError('Invalid form body', ErrorCodes.INVALID_FORM_BODY, {
			errors,
		}),

	[ErrorCodes.UNKNOWN_HARVEST]: new APIError(
		'Unknown data harvest',
		ErrorCodes.UNKNOWN_HARVEST
	),
	[ErrorCodes.UNKNOWN_PAYMENT_METHOD]: new APIError(
		'Unknown payment method',
		ErrorCodes.UNKNOWN_PAYMENT_METHOD
	),
	[ErrorCodes.UNKNOWN_SUBSCRIPTION]: new APIError(
		'Unknown subscription',
		ErrorCodes.UNKNOWN_SUBSCRIPTION
	),
	[ErrorCodes.UNKNOWN_SESSION]: new APIError(
		'Unknown checkout session',
		ErrorCodes.UNKNOWN_SESSION
	),

	[ErrorCodes.USER_LIMIT]: (retry: number) =>
		new APIError('You are being rate limited', ErrorCodes.USER_LIMIT, {
			retry_after: retry,
		}),
	[ErrorCodes.RESOURCE_LIMIT]: (retry: number) =>
		new APIError(
			'The resource is being rate limited',
			ErrorCodes.RESOURCE_LIMIT,
			{
				retry_after: retry,
			}
		),
	[ErrorCodes.IP_LIMIT]: (retry: number) =>
		new APIError(
			'You have been temporarily blocked from accessing our API due to exceeding our rate limits too often.',
			ErrorCodes.IP_LIMIT
		),
	[ErrorCodes.HARVEST_ALREADY_IN_PROGRESS]: new APIError(
		'Data harvest already in progress.',
		ErrorCodes.HARVEST_ALREADY_IN_PROGRESS
	),

	[ErrorCodes.CUSTOMER_DELETED]: new APIError(
		'Customer deleted.',
		ErrorCodes.CUSTOMER_DELETED
	),
	[ErrorCodes.UPDATE_CANCELLED_SUB]: new APIError(
		'Cannot update a cancelled subscription',
		ErrorCodes.UPDATE_CANCELLED_SUB
	),
	[ErrorCodes.USER_NOT_ADMIN]: new APIError(
		'The user is not an administrator of the selected guild',
		ErrorCodes.USER_NOT_ADMIN
	),
	[ErrorCodes.SUBSCRIPTION_ALREADY_APPLIED]: new APIError(
		'A subscription of this type has already been applied to the guild.',
		ErrorCodes.SUBSCRIPTION_ALREADY_APPLIED
	),
	[ErrorCodes.REINSTATE_FAILED_SUB]: new APIError(
		'Cannot reinstate a failed subscription',
		ErrorCodes.REINSTATE_FAILED_SUB
	),
	[ErrorCodes.COMPLETE_UNPAID]: new APIError(
		'Complete payment has been left unpaid',
		ErrorCodes.COMPLETE_UNPAID
	),

	[ErrorCodes.MAX_SUBSCRIPTIONS]: new APIError(
		'Maximum number of subscriptions reached (25)',
		ErrorCodes.MAX_SUBSCRIPTIONS
	),

	[ErrorCodes.FRAUD]: (area: string) =>
		process.env.NODE_ENV === 'development'
			? new APIError('Request blocked', ErrorCodes.FRAUD, {
					area: area,
			  })
			: //@ts-ignore
			  new APIError(undefined, undefined, [area[0] + area[area.length - 1]]),
	[ErrorCodes.FEATURE_DISABLED]: new APIError(
		'This feature has been temporarily disabled',
		ErrorCodes.FEATURE_DISABLED
	),

	[ErrorCodes.NOT_FOUND]: new APIError('404: Not Found'),
	[ErrorCodes.METHOD_NOT_ALLOWED]: new APIError('405: Method Not Allowed'),
	[ErrorCodes.UNPROCESSABLE_ENTITY]: new APIError('422: Unprocessable Entity'),
	[ErrorCodes.BAD_GATEWAY]: new APIError('502: Bad Gateway'),
	[ErrorCodes.INTERNAL_SERVER_ERROR]: (error: Error) =>
		new APIError(
			process.env.NODE_ENV === 'development'
				? error.message
				: '500: Internal Server Error',
			ErrorCodes.UNKNOWN,
			{
				stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
			}
		),

	[ErrorCodes.UNKNOWN]: new APIError('500: Internal Server Error'),
};

const _: Record<ErrorCodes, APIError | ((_: any) => APIError)> = Errors;
