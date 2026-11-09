import { error } from '@sveltejs/kit';
import { getPostBySlug } from '#lib/posts';

export function load({ params }) {
	const post = getPostBySlug(params.slug);

	if (!post) {
		throw error(404, `Artikel dengan judul "${params.slug}" tidak ditemukan.`);
	}

	return {
		slug: post.slug,
		metadata: post.metadata,
		component: post.component
	};
}
