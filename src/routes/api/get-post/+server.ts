import { json } from '@sveltejs/kit';
import fs from 'node:fs/promises';
import path from 'node:path';
import { SESSION_COOKIE_NAME, SESSION_SECRET_TOKEN } from '#lib/server/constants';

export async function GET({ url, cookies }) {
	const session = cookies.get(SESSION_COOKIE_NAME);
	if (session !== SESSION_SECRET_TOKEN) {
		return json({ success: false, error: 'Akses ditolak.' }, { status: 401 });
	}

	const slug = url.searchParams.get('slug');
	if (!slug) {
		return json({ success: false, error: 'Slug tidak valid' }, { status: 400 });
	}

	const cleanSlug = slug.replace(/[^a-zA-Z0-9_-]/g, '');
	const filePath = path.resolve(process.cwd(), 'src/posts', `${cleanSlug}.md`);

	try {
		const raw = await fs.readFile(filePath, 'utf-8');

		// Parse frontmatter
		const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
		if (!match) {
			return json({
				success: true,
				post: {
					slug: cleanSlug,
					title: cleanSlug,
					content: raw
				}
			});
		}

		const frontmatterStr = match[1];
		const bodyContent = match[2];

		const metadata: Record<string, any> = {};
		frontmatterStr.split('\n').forEach((line) => {
			const colonIndex = line.indexOf(':');
			if (colonIndex > 0) {
				const key = line.slice(0, colonIndex).trim();
				let val = line.slice(colonIndex + 1).trim();
				try {
					val = JSON.parse(val);
				} catch {
					if (val === 'true') val = true;
					else if (val === 'false') val = false;
				}
				metadata[key] = val;
			}
		});

		const isArchived = metadata.archived === true || metadata.status === 'arsip';
		const isDraft = !isArchived && (metadata.published === false || metadata.status === 'draft');
		const status: 'upload' | 'draft' | 'arsip' = isArchived ? 'arsip' : (isDraft ? 'draft' : 'upload');

		return json({
			success: true,
			post: {
				slug: cleanSlug,
				title: metadata.title || '',
				description: metadata.description || '',
				category: metadata.category || 'Investasi',
				tags: Array.isArray(metadata.tags) ? metadata.tags.join(', ') : metadata.tags || '',
				readTime: metadata.readTime || '5 min baca',
				status,
				published: status === 'upload',
				archived: status === 'arsip',
				content: bodyContent.trim()
			}
		});
	} catch (err: any) {
		return json({ success: false, error: 'File tidak ditemukan: ' + err.message }, { status: 404 });
	}
}

