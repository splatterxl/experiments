import * as jwt from 'jsonwebtoken';

export const JWT_TOKEN = process.env.JWT_TOKEN!;

export function sign(payload: any) {
	return jwt.sign(payload, JWT_TOKEN, {
		expiresIn: '30 days',
	});
}

export function verify<T>(token: string): T {
	return jwt.verify(token, JWT_TOKEN, {
		complete: false,
	}) as T;
}
