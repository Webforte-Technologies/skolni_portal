import type { User } from '../types/database';

declare global {
	namespace Express {
		interface Request {
			user?: Omit<User, 'password_hash'>;
		}
	}
}

export {};


