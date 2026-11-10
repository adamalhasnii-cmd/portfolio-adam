import { json } from '@sveltejs/kit';
import { recordView, getAllViewCounts, getAllReferrerStats, getTotalReferrerStats } from '#lib/server/views';
import { SESSION_COOKIE_NAME, SESSION_SECRET_TOKEN } from '#lib/server/constants';

export async function POST({ request, getClientAddress }) {
	try {
		const body = await request.json().catch(() => ({}));
		const { slug, visitorId, ref } = body;

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

		const headerReferer = request.headers.get('referer');
		const result = await recordView(slug.trim(), effectiveVisitorId.trim(), ref, headerReferer);

		return json({
			success: true,
			count: result.count
		});
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
	const referrers = await getAllReferrerStats();
	const totalReferrers = await getTotalReferrerStats();

	return json({
		success: true,
		views,
		referrers,
		totalReferrers
	});
}
