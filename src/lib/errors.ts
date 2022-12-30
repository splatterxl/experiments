export class Error {
	#baggage: any;

	constructor(public message: string, public code = 0, baggage?: any) {
		this.#baggage = baggage ?? {};
	}

	toJSON() {
		return { message: this.message, code: this.code, ...this.#baggage };
	}
}

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

	// http
	NOT_FOUND = 404,
	METHOD_NOT_ALLOWED = 405,
	UNPROCESSABLE_ENTITY = 422,
	BAD_GATEWAY = 502,
	INTERNAL_SERVER_ERROR = 500,
}

export const Errors = {
	[ErrorCodes.LOGIN]: new Error(
		'Please log in before attempting this action',
		ErrorCodes.LOGIN
	),
	[ErrorCodes.AUTH_EXPIRED]: new Error(
		'Authentication token expired. Please log in again.',
		ErrorCodes.AUTH_EXPIRED
	),
	[ErrorCodes.MISSING_ACCESS]: new Error(
		'Missing access',
		ErrorCodes.MISSING_ACCESS
	),

	[ErrorCodes.INVALID_SCOPE]: new Error(
		'Invalid scope',
		ErrorCodes.INVALID_SCOPE
	),
	[ErrorCodes.GUILDS_REQUIRED]: new Error(
		'To prevent spam and fraud across our services, we ask for read-only access to your servers list. We will \
    never share or view this data. Consult our privacy policy for more information: https://exps.splt.dev/privacy',
		ErrorCodes.INVALID_SCOPE
	),
	[ErrorCodes.EMAIL_REQUIRED]: new Error(
		'We require read-only access to your email address to send you important updates about your account and payments, \
    and to provide our Mailing List services. We will never send you promotional content without consent. Consult our privacy \
    policy for more information: https://exps.splt.dev/privacy',
		ErrorCodes.INVALID_SCOPE
	),
	[ErrorCodes.ANTI_SPAM_CHECK_FAILED]: new Error(
		'To prevent spam across our services, we require accounts to be legitimate to sign in.',
		ErrorCodes.ANTI_SPAM_CHECK_FAILED
	),

	[ErrorCodes.INVALID_REQUEST_BODY]: new Error(
		'Invalid request body. Must be application/json',
		ErrorCodes.INVALID_REQUEST_BODY
	),
	[ErrorCodes.INVALID_HOST]: new Error('Invalid host', ErrorCodes.INVALID_HOST),
	[ErrorCodes.INVALID_SIGNATURE]: new Error(
		'Invalid signature',
		ErrorCodes.INVALID_SIGNATURE
	),
	[ErrorCodes.INVALID_PAYMENT_METHOD_ID]: new Error(
		'Invalid payment method ID',
		ErrorCodes.INVALID_PAYMENT_METHOD_ID
	),
	[ErrorCodes.INVALID_SUBSCRIPTION_ID]: new Error(
		'Invalid subscription ID',
		ErrorCodes.INVALID_SUBSCRIPTION_ID
	),
	[ErrorCodes.INVALID_GUILD_ID]: new Error(
		'Invalid guild ID',
		ErrorCodes.INVALID_SUBSCRIPTION_ID
	),
	[ErrorCodes.INVALID_PRODUCT]: new Error(
		'Invalid product',
		ErrorCodes.INVALID_PRODUCT
	),
	[ErrorCodes.INVALID_PRICE]: new Error(
		'Invalid price',
		ErrorCodes.INVALID_PRICE
	),
	[ErrorCodes.INVALID_TRIAL]: new Error(
		'Invalid trial',
		ErrorCodes.INVALID_TRIAL
	),
	[ErrorCodes.INVALID_SESSION]: new Error(
		'Invalid checkout session',
		ErrorCodes.INVALID_SESSION
	),

	[ErrorCodes.UNKNOWN_HARVEST]: new Error(
		'Unknown data harvest',
		ErrorCodes.UNKNOWN_HARVEST
	),
	[ErrorCodes.UNKNOWN_PAYMENT_METHOD]: new Error(
		'Unknown payment method',
		ErrorCodes.UNKNOWN_PAYMENT_METHOD
	),
	[ErrorCodes.UNKNOWN_SUBSCRIPTION]: new Error(
		'Unknown subscription',
		ErrorCodes.UNKNOWN_SUBSCRIPTION
	),
	[ErrorCodes.UNKNOWN_SESSION]: new Error(
		'Unknown checkout session',
		ErrorCodes.UNKNOWN_SESSION
	),

	[ErrorCodes.USER_LIMIT]: (retry: number) =>
		new Error('You are being rate limited', ErrorCodes.USER_LIMIT, {
			retry_after: retry,
		}),
	[ErrorCodes.RESOURCE_LIMIT]: (retry: number) =>
		new Error('The resource is being rate limited', ErrorCodes.RESOURCE_LIMIT, {
			retry_after: retry,
		}),
	[ErrorCodes.IP_LIMIT]: (retry: number) =>
		new Error(
			'You have been temporarily blocked from accessing our API due to exceeding our rate limits too often.',
			ErrorCodes.IP_LIMIT
		),
	[ErrorCodes.HARVEST_ALREADY_IN_PROGRESS]: new Error(
		'Data harvest already in progress.',
		ErrorCodes.HARVEST_ALREADY_IN_PROGRESS
	),

	[ErrorCodes.CUSTOMER_DELETED]: new Error(
		'Customer deleted.',
		ErrorCodes.CUSTOMER_DELETED
	),
	[ErrorCodes.UPDATE_CANCELLED_SUB]: new Error(
		'Cannot update a cancelled subscription',
		ErrorCodes.UPDATE_CANCELLED_SUB
	),
	[ErrorCodes.USER_NOT_ADMIN]: new Error(
		'The user is not an administrator of the selected guild',
		ErrorCodes.USER_NOT_ADMIN
	),
	[ErrorCodes.SUBSCRIPTION_ALREADY_APPLIED]: new Error(
		'A subscription of this type has already been applied to the guild.',
		ErrorCodes.SUBSCRIPTION_ALREADY_APPLIED
	),
	[ErrorCodes.REINSTATE_FAILED_SUB]: new Error(
		'Cannot reinstate a failed subscription',
		ErrorCodes.REINSTATE_FAILED_SUB
	),
	[ErrorCodes.COMPLETE_UNPAID]: new Error(
		'Complete payment has been left unpaid',
		ErrorCodes.COMPLETE_UNPAID
	),

	[ErrorCodes.MAX_SUBSCRIPTIONS]: new Error(
		'Maximum number of subscriptions reached (25)',
		ErrorCodes.MAX_SUBSCRIPTIONS
	),

	[ErrorCodes.FRAUD]: new Error(undefined as any, ErrorCodes.FRAUD),

	[ErrorCodes.NOT_FOUND]: new Error('404: Not Found'),
	[ErrorCodes.METHOD_NOT_ALLOWED]: new Error('405: Method Not Allowed'),
	[ErrorCodes.UNPROCESSABLE_ENTITY]: new Error('422: Unprocessable Entity'),
	[ErrorCodes.BAD_GATEWAY]: new Error('502: Bad Gateway'),
	[ErrorCodes.INTERNAL_SERVER_ERROR]: new Error('500: Internal Server Error'),
};

const _: Record<ErrorCodes, Error | ((_: any) => Error)> = Errors;
