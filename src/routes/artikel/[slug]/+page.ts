import { error } from '@sveltejs/kit';
import { getPostBySlug } from '#lib/posts';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data, params }) => {
	const post = getPostBySlug(params.slug);

	if (!post) {
		throw error(404, `Artikel dengan judul "${params.slug}" tidak ditemukan.`);
	}

	return {
		...data,
		slug: post.slug,
		metadata: post.metadata,
		component: post.component
	};
};
