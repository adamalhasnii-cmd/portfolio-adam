export interface PostMetadata {
	title: string;
	description: string;
	date: string;
	category: string;
	tags?: string[];
	readTime?: string;
	featured?: boolean;
	author?: string;
	published?: boolean;
}

export interface Post {
	slug: string;
	metadata: PostMetadata;
}
