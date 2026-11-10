import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SESSION_COOKIE_NAME } from '#lib/server/constants';

export const POST: RequestHandler = async ({ cookies }) => {
	cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
	throw redirect(303, '/');
};

