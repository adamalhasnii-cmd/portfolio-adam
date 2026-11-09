import { getAllPosts, getAllCategories } from '#lib/posts';

export function load() {
	const posts = getAllPosts();
	const categories = getAllCategories();
	return {
		posts,
		categories
	};
}
