import { json } from '@sveltejs/kit';
import { recordView, getAllViewCounts } from '#lib/server/views';
import { SESSION_COOKIE_NAME, SESSION_SECRET_TOKEN } from '#lib/server/constants';

export async function POST({ request, getClientAddress }) {
	try {
		const body = await request.json().catch(() => ({}));
		const { slug, visitorId } = body;

		if (!slug || typeof slug !== 'string') {
			return json({ success: false, error: 'Slug tidak valid' }, { status: 400 });
		}

		// Fallback to IP address if visitorId is empty
		let effectiveVisitorId = visitorId;
		if (!effectiveVisitorId || typeof effectiveVisitorId !== 'string') {
			try {
				effectiveVisitorId = getClientAddress();
			} catch {
				effectiveVisitorId = 'anonymous_' + Math.random().toString(36).slice(2);
			}
		}

		await recordView(slug.trim(), effectiveVisitorId.trim());

		// Return success without disclosing reader count publicly
		return json({ success: true });
	} catch (err: any) {
		return json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
	}
}

export async function GET({ cookies }) {
	const session = cookies.get(SESSION_COOKIE_NAME);
	if (session !== SESSION_SECRET_TOKEN) {
		return json({ success: false, error: 'Akses khusus admin' }, { status: 401 });
	}

	const views = await getAllViewCounts();
	return json({ success: true, views });
}
