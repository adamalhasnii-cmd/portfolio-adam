import type { PageServerLoad } from './$types';
import { SESSION_COOKIE_NAME, SESSION_SECRET_TOKEN } from '#lib/server/constants';
import { getViewCount } from '#lib/server/views';

export const load: PageServerLoad = async ({ params, cookies }) => {
	const session = cookies.get(SESSION_COOKIE_NAME);
	const isAdmin = session === SESSION_SECRET_TOKEN;

	return {
		isAdmin,
		viewCount: isAdmin ? await getViewCount(params.slug) : 0
	};
};
