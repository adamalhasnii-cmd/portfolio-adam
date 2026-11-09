import type { Post, PostMetadata } from './types';

export function getAllPosts(): Post[] {
	const modules = import.meta.glob<{ metadata: PostMetadata; default: any }>('/src/posts/*.md', {
		eager: true
	});

	const posts: Post[] = [];

	for (const path in modules) {
		const mod = modules[path];
		const slug = path.split('/').pop()?.replace(/\.md$/, '') || '';

		if (mod && mod.metadata && slug) {
			if (mod.metadata.published !== false) {
				posts.push({
					slug,
					metadata: {
						...mod.metadata,
						tags: mod.metadata.tags || [],
						readTime: mod.metadata.readTime || '5 min baca',
						date: mod.metadata.date || new Date().toISOString().split('T')[0]
					}
				});
			}
		}
	}

	return posts.sort(
		(a, b) => new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime()
	);
}

export function getPostBySlug(slug: string) {
	const modules = import.meta.glob<{ metadata: PostMetadata; default: any }>('/src/posts/*.md', {
		eager: true
	});
	const path = `/src/posts/${slug}.md`;
	const mod = modules[path];
	if (!mod) return null;

	return {
		slug,
		metadata: {
			...mod.metadata,
			tags: mod.metadata.tags || [],
			readTime: mod.metadata.readTime || '5 min baca'
		},
		component: mod.default
	};
}

export function getAllCategories(): string[] {
	const posts = getAllPosts();
	const cats = new Set<string>();
	posts.forEach((p) => {
		if (p.metadata.category) cats.add(p.metadata.category);
	});
	return Array.from(cats);
}

