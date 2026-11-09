import { getAllPosts } from '#lib/posts';

export function load() {
	const posts = getAllPosts();
	return {
		posts
	};
}
