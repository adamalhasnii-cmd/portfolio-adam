import type { LayoutServerLoad } from './$types';
import { SESSION_COOKIE_NAME, SESSION_SECRET_TOKEN } from '#lib/server/constants';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const session = cookies.get(SESSION_COOKIE_NAME);
	const isAdmin = session === SESSION_SECRET_TOKEN;

	return {
		isAdmin
	};
};

