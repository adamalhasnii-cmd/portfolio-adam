import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

interface PostViews {
	total: number;
	uniqueViewers: string[]; // List of hashed visitor IDs
}

type ViewsStore = Record<string, PostViews>;

// In-memory cache for fast lookups and atomic updates
let viewsCache: ViewsStore | null = null;
let isLoaded = false;

const PRIMARY_FILE = path.resolve(process.cwd(), 'src/data/views.json');
const FALLBACK_FILE = '/tmp/portfolio-views.json';

async function loadViews(): Promise<ViewsStore> {
	if (isLoaded && viewsCache !== null) {
		return viewsCache;
	}

	viewsCache = {};

	// 1. Try reading from primary file (src/data/views.json)
	try {
		const raw = await fs.readFile(PRIMARY_FILE, 'utf-8');
		const parsed = JSON.parse(raw);
		if (parsed && typeof parsed === 'object') {
			viewsCache = { ...parsed };
		}
	} catch {
		// Ignore if not found or unreadable
	}

	// 2. Try merging from fallback file (/tmp/portfolio-views.json) if it exists with more data
	try {
		const rawFallback = await fs.readFile(FALLBACK_FILE, 'utf-8');
		const parsedFallback = JSON.parse(rawFallback);
		if (parsedFallback && typeof parsedFallback === 'object') {
			for (const [slug, data] of Object.entries(parsedFallback as ViewsStore)) {
				if (!viewsCache[slug] || (data?.total || 0) > (viewsCache[slug]?.total || 0)) {
					viewsCache[slug] = data;
				}
			}
		}
	} catch {
		// Ignore fallback error
	}

	isLoaded = true;
	return viewsCache;
}

async function persistViews(): Promise<void> {
	if (!viewsCache) return;

	const jsonString = JSON.stringify(viewsCache, null, 2);

	// Try writing to primary file
	try {
		await fs.mkdir(path.dirname(PRIMARY_FILE), { recursive: true });
		await fs.writeFile(PRIMARY_FILE, jsonString, 'utf-8');
	} catch {
		// In serverless environments (e.g. Vercel), primary file might be read-only
	}

	// Always write to fallback /tmp as well
	try {
		await fs.writeFile(FALLBACK_FILE, jsonString, 'utf-8');
	} catch {
		// Ignore fallback error
	}
}

/**
 * Hash visitor identifier with SHA-256 to ensure privacy while preventing duplicate counts.
 */
function hashVisitorId(rawId: string): string {
	return crypto.createHash('sha256').update(rawId).digest('hex').slice(0, 24);
}

/**
 * Record a unique view for a specific article slug.
 * If the visitor has already viewed this article, it will NOT increment the count.
 */
export async function recordView(
	slug: string,
	rawVisitorId: string
): Promise<{ incremented: boolean; count: number }> {
	const store = await loadViews();
	const visitorHash = hashVisitorId(rawVisitorId || 'anonymous_' + Math.random());

	if (!store[slug]) {
		store[slug] = {
			total: 0,
			uniqueViewers: []
		};
	}

	const postData = store[slug];

	// Strict deduplication: check if this visitor hash already viewed this slug
	if (postData.uniqueViewers.includes(visitorHash)) {
		return {
			incremented: false,
			count: postData.total
		};
	}

	// New unique viewer
	postData.uniqueViewers.push(visitorHash);
	postData.total += 1;

	await persistViews();

	return {
		incremented: true,
		count: postData.total
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

