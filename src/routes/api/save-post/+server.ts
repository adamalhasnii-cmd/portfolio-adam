import { json } from '@sveltejs/kit';
import fs from 'node:fs/promises';
import path from 'node:path';
import { SESSION_COOKIE_NAME, SESSION_SECRET_TOKEN } from '#lib/server/constants';

export async function POST({ request, cookies }) {
	const session = cookies.get(SESSION_COOKIE_NAME);
	if (session !== SESSION_SECRET_TOKEN) {
		return json(
			{ success: false, error: 'Akses ditolak. Anda harus login terlebih dahulu sebagai admin.' },
			{ status: 401 }
		);
	}

	try {
		const data = await request.json();
		const { title, description, category, tags, readTime, content, slug, author, originalSlug } = data;

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

		const targetStatus: 'upload' | 'draft' | 'arsip' =
			data.status === 'arsip'
				? 'arsip'
				: data.status === 'draft' || data.published === false
				? 'draft'
				: 'upload';

		const frontmatter = [
			'---',
			`title: ${JSON.stringify(title)}`,
			`description: ${JSON.stringify(description || '')}`,
			`date: ${JSON.stringify(today)}`,
			`category: ${JSON.stringify(category || 'Investasi')}`,
			`tags: ${JSON.stringify(tagList)}`,
			`readTime: ${JSON.stringify(readTime || '5 min baca')}`,
			'featured: false',
			`published: ${targetStatus === 'upload'}`,
			`archived: ${targetStatus === 'arsip'}`,
			`status: ${JSON.stringify(targetStatus)}`,
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
			if (originalSlug && originalSlug !== postSlug) {
				const oldClean = originalSlug.replace(/[^a-zA-Z0-9_-]/g, '');
				if (oldClean) {
					try {
						await fs.unlink(path.join(postsDir, `${oldClean}.md`));
					} catch {}
				}
			}
			await fs.writeFile(filePath, frontmatter, 'utf-8');
			const statusLabel =
				targetStatus === 'upload'
					? 'di-upload & diterbitkan'
					: targetStatus === 'arsip'
					? 'disimpan ke Arsip'
					: 'disimpan sebagai Draft';
			return json({
				success: true,
				slug: postSlug,
				status: targetStatus,
				message: `Artikel "${title}" berhasil ${statusLabel} (${postSlug}.md)!`
			});
		} catch (fileErr: any) {
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

export async function PATCH({ request, cookies }) {
	const session = cookies.get(SESSION_COOKIE_NAME);
	if (session !== SESSION_SECRET_TOKEN) {
		return json({ success: false, error: 'Akses ditolak.' }, { status: 401 });
	}

	try {
		const { slug, status } = await request.json().catch(() => ({}));
		if (!slug || !['upload', 'draft', 'arsip'].includes(status)) {
			return json({ success: false, error: 'Parameter slug dan status tidak valid' }, { status: 400 });
		}

		const cleanSlug = slug.replace(/[^a-zA-Z0-9_-]/g, '');
		const postsDir = path.resolve(process.cwd(), 'src/posts');
		const filePath = path.join(postsDir, `${cleanSlug}.md`);

		const raw = await fs.readFile(filePath, 'utf-8');
		const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
		if (!match) {
			return json({ success: false, error: 'Format artikel tidak valid' }, { status: 400 });
		}

		let frontmatterStr = match[1];
		const body = match[2];

		const isUpload = status === 'upload';
		const isArsip = status === 'arsip';

		if (/published:\s*(true|false)/i.test(frontmatterStr)) {
			frontmatterStr = frontmatterStr.replace(/published:\s*(true|false)/gi, `published: ${isUpload}`);
		} else {
			frontmatterStr += `\npublished: ${isUpload}`;
		}

		if (/archived:\s*(true|false)/i.test(frontmatterStr)) {
			frontmatterStr = frontmatterStr.replace(/archived:\s*(true|false)/gi, `archived: ${isArsip}`);
		} else {
			frontmatterStr += `\narchived: ${isArsip}`;
		}

		if (/status:\s*("[^"]*"|'[^']*'|\w+)/i.test(frontmatterStr)) {
			frontmatterStr = frontmatterStr.replace(/status:\s*("[^"]*"|'[^']*'|\w+)/gi, `status: "${status}"`);
		} else {
			frontmatterStr += `\nstatus: "${status}"`;
		}

		const updatedContent = `---\n${frontmatterStr.trim()}\n---\n\n${body.trim()}\n`;
		await fs.writeFile(filePath, updatedContent, 'utf-8');

		const label = status === 'upload' ? 'Upload' : status === 'arsip' ? 'Arsip' : 'Draft';
		return json({
			success: true,
			status,
			message: `Status tulisan berhasil diubah menjadi ${label}!`
		});
	} catch (err: any) {
		return json({ success: false, error: err?.message || 'Gagal mengubah status tulisan' }, { status: 500 });
	}
}

export async function DELETE({ request, cookies }) {
	const session = cookies.get(SESSION_COOKIE_NAME);
	if (session !== SESSION_SECRET_TOKEN) {
		return json({ success: false, error: 'Akses ditolak.' }, { status: 401 });
	}

	try {
		const { slug } = await request.json().catch(() => ({}));
		if (!slug || typeof slug !== 'string') {
			return json({ success: false, error: 'Slug artikel wajib diisi' }, { status: 400 });
		}

		const cleanSlug = slug.replace(/[^a-zA-Z0-9_-]/g, '');
		const postsDir = path.resolve(process.cwd(), 'src/posts');
		const filePath = path.join(postsDir, `${cleanSlug}.md`);

		try {
			await fs.unlink(filePath);
			return json({ success: true, message: `Artikel ${cleanSlug}.md berhasil dihapus dari project!` });
		} catch {
			return json({ success: false, error: 'File artikel tidak ditemukan di disk.' }, { status: 404 });
		}
	} catch (err: any) {
		return json({ success: false, error: err?.message || 'Gagal menghapus artikel' }, { status: 500 });
	}
}
