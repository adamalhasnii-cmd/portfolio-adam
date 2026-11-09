import { getAllPosts, getAllCategories } from '#lib/posts';

export function load() {
	return {
		posts: getAllPosts(),
		categories: getAllCategories()
	};
}
