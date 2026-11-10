import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

export interface PostViews {
	total: number;
	uniqueViewers: string[]; // List of hashed visitor IDs
	referrers?: Record<string, number>; // Breakdown of unique readers by referral source
	uniqueReferrerVisitors?: string[]; // Deduplication per visitorHash:source
}

export type ViewsStore = Record<string, PostViews>;

// In-memory cache for fast lookups
let viewsCache: ViewsStore | null = null;

const PRIMARY_FILE = path.resolve(process.cwd(), 'src/data/views.json');

async function loadViews(): Promise<ViewsStore> {
	// Always read primary file from disk so updates and file edits are immediately live
	try {
		const raw = await fs.readFile(PRIMARY_FILE, 'utf-8');
		const parsed = JSON.parse(raw);
		if (parsed && typeof parsed === 'object') {
			viewsCache = { ...parsed };
			return viewsCache;
		}
	} catch {
		// Ignore if not found or unreadable
	}

	if (viewsCache) return viewsCache;
	viewsCache = {};
	return viewsCache;
}

async function persistViews(): Promise<void> {
	if (!viewsCache) return;

	const jsonString = JSON.stringify(viewsCache, null, 2);

	try {
		await fs.mkdir(path.dirname(PRIMARY_FILE), { recursive: true });
		await fs.writeFile(PRIMARY_FILE, jsonString, 'utf-8');
	} catch {
		// In serverless environments, file system might be read-only
	}
}

/**
 * Hash visitor identifier with SHA-256 to ensure privacy while preventing duplicate counts.
 */
function hashVisitorId(rawId: string): string {
	return crypto.createHash('sha256').update(rawId).digest('hex').slice(0, 24);
}

/**
 * Normalize referrer source tags to known standard platforms.
 */
export function normalizeReferrer(ref?: string | null, headerReferer?: string | null): string {
	const raw = (ref || '').toLowerCase().trim();

	if (['whatsapp', 'wa', 'chat.whatsapp.com', 'api.whatsapp.com'].includes(raw)) return 'whatsapp';
	if (['instagram', 'ig', 'instagram.com'].includes(raw)) return 'instagram';
	if (['tiktok', 'tt', 'tiktok.com'].includes(raw)) return 'tiktok';
	if (['twitter', 'x', 't.co', 'twitter.com', 'x.com'].includes(raw)) return 'twitter';
	if (['telegram', 'tg', 't.me', 'telegram.org'].includes(raw)) return 'telegram';
	if (['facebook', 'fb', 'facebook.com', 'fb.com'].includes(raw)) return 'facebook';
	if (['linkedin', 'linkedin.com'].includes(raw)) return 'linkedin';
	if (['salin_tautan', 'share', 'copy', 'salin', 'link'].includes(raw)) return 'salin_tautan';
	if (['direct', 'langsung'].includes(raw)) return 'direct';

	// Check HTTP Referer header if ref parameter wasn't provided or was generic
	if (headerReferer) {
		const h = headerReferer.toLowerCase();
		if (h.includes('whatsapp') || h.includes('wa.me')) return 'whatsapp';
		if (h.includes('instagram.com')) return 'instagram';
		if (h.includes('tiktok.com')) return 'tiktok';
		if (h.includes('t.co') || h.includes('twitter.com') || h.includes('x.com')) return 'twitter';
		if (h.includes('t.me') || h.includes('telegram.org')) return 'telegram';
		if (h.includes('facebook.com') || h.includes('fb.com')) return 'facebook';
		if (h.includes('linkedin.com')) return 'linkedin';
		if (h.includes('google.') || h.includes('bing.') || h.includes('yahoo.')) return 'mesin_pencari';
	}

	if (raw && /^[a-z0-9_-]{2,30}$/.test(raw)) {
		return raw;
	}

	return 'direct';
}

/**
 * Record a unique view for a specific article slug along with its referral source.
 */
export async function recordView(
	slug: string,
	rawVisitorId: string,
	rawReferrer?: string | null,
	headerReferer?: string | null
): Promise<{ incremented: boolean; count: number; referrers: Record<string, number> }> {
	const store = await loadViews();
	const visitorHash = hashVisitorId(rawVisitorId || 'anonymous_' + Math.random());
	const source = normalizeReferrer(rawReferrer, headerReferer);

	if (!store[slug]) {
		store[slug] = {
			total: 0,
			uniqueViewers: [],
			referrers: {},
			uniqueReferrerVisitors: []
		};
	}

	const postData = store[slug];
	if (!postData.referrers) {
		postData.referrers = {};
	}
	if (!postData.uniqueReferrerVisitors) {
		postData.uniqueReferrerVisitors = [];
	}

	let incremented = false;

	// 1. Overall unique visitor deduplication
	if (!postData.uniqueViewers.includes(visitorHash)) {
		postData.uniqueViewers.push(visitorHash);
		postData.total += 1;
		incremented = true;
	}

	// 2. Track referral source uniquely per visitor (prevent refresh-spamming the count)
	const refKey = `${visitorHash}:${source}`;
	if (!postData.uniqueReferrerVisitors.includes(refKey)) {
		postData.uniqueReferrerVisitors.push(refKey);
		postData.referrers[source] = (postData.referrers[source] || 0) + 1;
	}

	await persistViews();

	return {
		incremented,
		count: postData.total,
		referrers: postData.referrers
	};
}

/**
 * Get total unique views for a specific article slug.
 */
export async function getViewCount(slug: string): Promise<number> {
	const store = await loadViews();
	return store[slug]?.total || 0;
}

/**
 * Get referrer breakdown for a specific article slug.
 */
export async function getReferrersForSlug(slug: string): Promise<Record<string, number>> {
	const store = await loadViews();
	return store[slug]?.referrers || {};
}

/**
 * Get all view counts (slug -> count) for admin reporting.
 */
export async function getAllViewCounts(): Promise<Record<string, number>> {
	const store = await loadViews();
	const counts: Record<string, number> = {};

	for (const [slug, data] of Object.entries(store)) {
		counts[slug] = data?.total || 0;
	}

	return counts;
}

/**
 * Get all referrer statistics mapped by slug.
 */
export async function getAllReferrerStats(): Promise<Record<string, Record<string, number>>> {
	const store = await loadViews();
	const result: Record<string, Record<string, number>> = {};

	for (const [slug, data] of Object.entries(store)) {
		result[slug] = data?.referrers || {};
	}

	return result;
}

/**
 * Get aggregate totals of all referral sources across all posts.
 */
export async function getTotalReferrerStats(): Promise<Record<string, number>> {
	const store = await loadViews();
	const totals: Record<string, number> = {};

	for (const data of Object.values(store)) {
		if (data?.referrers) {
			for (const [source, count] of Object.entries(data.referrers)) {
				totals[source] = (totals[source] || 0) + (Number(count) || 0);
			}
		}
	}

	return totals;
}

/**
 * Get grand total views across all articles.
 */
export async function getTotalViews(): Promise<number> {
	const store = await loadViews();
	let total = 0;
	for (const data of Object.values(store)) {
		total += data?.total || 0;
	}
	return total;
}
