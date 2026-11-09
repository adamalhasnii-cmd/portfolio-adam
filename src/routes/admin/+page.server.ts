import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { getAllPosts } from '#lib/posts';

const ADMIN_USER = 'adamin';
const ADMIN_PASS = 'fronTalistu99&!';
const SESSION_COOKIE_NAME = 'adam_admin_token';
const SESSION_SECRET_TOKEN = 'auth_session_adamin_portfolio_secret_2026';

export const load: PageServerLoad = async ({ cookies }) => {
	const session = cookies.get(SESSION_COOKIE_NAME);
	const isAuthenticated = session === SESSION_SECRET_TOKEN;

	return {
		isAuthenticated,
		posts: isAuthenticated ? getAllPosts() : []
	};
};

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const formData = await request.formData();
		const username = formData.get('username')?.toString().trim();
		const password = formData.get('password')?.toString();

		if (!username || !password) {
			return fail(400, {
				error: 'Username dan password wajib diisi!',
				username
			});
		}

		if (username !== ADMIN_USER || password !== ADMIN_PASS) {
			return fail(401, {
				error: 'Username atau password salah. Silakan coba lagi!',
				username
			});
		}

		// Set authentication session cookie
		cookies.set(SESSION_COOKIE_NAME, SESSION_SECRET_TOKEN, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: false,
			maxAge: 60 * 60 * 24 * 7 // 7 hari
		});

		return { success: true };
	},

	logout: async ({ cookies }) => {
		cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
		return { success: true };
	}
};
