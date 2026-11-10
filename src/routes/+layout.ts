import { getAllPosts, getAllCategories } from '#lib/posts';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data }) => {
	return {
		...data,
		posts: getAllPosts(),
		categories: getAllCategories()
	};
};

