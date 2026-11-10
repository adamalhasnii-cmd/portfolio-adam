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
	archived?: boolean;
	status?: 'upload' | 'draft' | 'arsip';
}

export interface Post {
	slug: string;
	metadata: PostMetadata;
}

