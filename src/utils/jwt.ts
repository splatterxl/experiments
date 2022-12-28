import * as jwt from 'jsonwebtoken';

export const JWT_TOKEN = process.env.JWT_TOKEN!;

export function sign(payload: any) {
	return jwt.sign(payload, JWT_TOKEN, {
		algorithm: 'RS256',
		expiresIn: '30 days',
	});
}

export function verify(token: string) {
	return jwt.verify(token, JWT_TOKEN, {
		algorithms: ['RS256'],
		complete: false,
	});
}
