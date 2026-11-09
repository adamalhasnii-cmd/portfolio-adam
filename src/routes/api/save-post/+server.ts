import { json } from '@sveltejs/kit';
import fs from 'node:fs/promises';
import path from 'node:path';

export async function POST({ request }) {
	try {
		const data = await request.json();
		const { title, description, category, tags, readTime, content, slug, author } = data;

		if (!title || !content) {
			return json({ success: false, error: 'Judul dan isi tulisan wajib diisi' }, { status: 400 });
		}

		const postSlug = (slug || title)
			.toLowerCase()
			.trim()
			.replace(/[^\w\s-]/g, '')
			.replace(/[\s_-]+/g, '-')
			.replace(/^-+|-+$/g, '');

		const today = new Date().toISOString().split('T')[0];
		const tagList = Array.isArray(tags)
			? tags
			: (tags || '')
					.split(',')
					.map((t: string) => t.trim())
					.filter(Boolean);

		const frontmatter = [
			'---',
			`title: ${JSON.stringify(title)}`,
			`description: ${JSON.stringify(description || '')}`,
			`date: ${JSON.stringify(today)}`,
			`category: ${JSON.stringify(category || 'Investasi')}`,
			`tags: ${JSON.stringify(tagList)}`,
			`readTime: ${JSON.stringify(readTime || '5 min baca')}`,
			'featured: false',
			'published: true',
			`author: ${JSON.stringify(author || 'Adam Alhasni')}`,
			'---',
			'',
			content.trim(),
			''
		].join('\n');

		const postsDir = path.resolve(process.cwd(), 'src/posts');
		const filePath = path.join(postsDir, `${postSlug}.md`);

		try {
			await fs.mkdir(postsDir, { recursive: true });
			await fs.writeFile(filePath, frontmatter, 'utf-8');
			return json({
				success: true,
				slug: postSlug,
				message: `Artikel "${title}" berhasil disimpan sebagai ${postSlug}.md!`
			});
		} catch (fileErr: any) {
			// In case environment is read-only (e.g. serverless Vercel function)
			return json({
				success: false,
				readOnly: true,
				markdown: frontmatter,
				error: 'Lingkungan Vercel bersifat read-only. Silakan salin atau unduh file Markdown ini untuk disimpan.'
			});
		}
	} catch (err: any) {
		console.error('Save post error:', err);
		return json({ success: false, error: err.message || 'Terjadi kesalahan sistem' }, { status: 500 });
	}
}

