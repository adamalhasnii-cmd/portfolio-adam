<script lang="ts">
	import type { PageProps } from './$types';
	import { Search, Clock, Calendar, ArrowRight, Tag, BookOpen, Filter } from '@lucide/svelte';

	let { data }: PageProps = $props();

	let searchQuery = $state('');
	let selectedCategory = $state('Semua');

	const categories = $derived(['Semua', ...(data.categories || [])]);

	const filteredPosts = $derived(
		(data.posts || []).filter((post) => {
			const matchCategory =
				selectedCategory === 'Semua' || post.metadata.category === selectedCategory;

			const q = searchQuery.toLowerCase().trim();
			const matchSearch =
				!q ||
				post.metadata.title.toLowerCase().includes(q) ||
				(post.metadata.description && post.metadata.description.toLowerCase().includes(q)) ||
				(post.metadata.tags && post.metadata.tags.some((t: string) => t.toLowerCase().includes(q)));

			return matchCategory && matchSearch;
		})
	);
</script>

<svelte:head>
	<title>Semua Tulisan — 911</title>
	<meta name="description" content="Arsip lengkap catatan pemikiran seputar keuangan, strategi investasi, dan refleksi arah dunia." />
</svelte:head>

<div class="py-10 sm:py-16 bg-[#FCFFFF] dark:bg-[#07121e] transition-colors">
	<div class="max-w-6xl mx-auto px-4 sm:px-6">
		<!-- Header -->
		<div class="max-w-2xl mb-12">
			<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0593C6]/10 text-[#0593C6] text-xs font-semibold mb-4">
				<BookOpen class="w-3.5 h-3.5" />
				Koleksi Lengkap
			</div>
			<h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
				Semua Pemikiran & Tulisan
			</h1>
			<p class="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed">
				Eksplorasi sudut pandang tentang bagaimana uang bekerja, cara mempertahankan modal dari badai ekonomi, dan memilih keputusan rasional di masa depan.
			</p>
		</div>

		<!-- Search & Category Filters Bar -->
		<div class="space-y-6 mb-10 pb-8 border-b border-slate-200 dark:border-slate-800">
			<!-- Search Bar -->
			<div class="relative max-w-xl">
				<Search class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Cari judul artikel, topik, atau kata kunci..."
					class="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white dark:bg-[#0d1e30] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0593C6] focus:border-transparent text-sm shadow-xs transition"
				/>
				{#if searchQuery}
					<button
						onclick={() => searchQuery = ''}
						class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold px-2 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded text-slate-600 dark:text-slate-300 transition"
					>
						Hapus
					</button>
				{/if}
			</div>

			<!-- Category Pills -->
			<div class="flex flex-wrap items-center gap-2">
				<div class="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">
					<Filter class="w-3.5 h-3.5" />
					<span>Kategori:</span>
				</div>
				{#each categories as category}
					<button
						onclick={() => selectedCategory = category}
						class="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer {selectedCategory === category
							? 'bg-[#0593C6] text-white shadow-sm shadow-[#0593C6]/30'
							: 'bg-white dark:bg-[#0d1e30] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'}"
					>
						{category}
					</button>
				{/each}
			</div>
		</div>

		<!-- Posts Counter -->
		<div class="flex items-center justify-between text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">
			<div>
				Menampilkan <span class="font-bold text-slate-900 dark:text-white">{filteredPosts.length}</span> tulisan
				{#if selectedCategory !== 'Semua'}
					dalam kategori <span class="font-bold text-[#0593C6]">"{selectedCategory}"</span>
				{/if}
			</div>
			{#if searchQuery}
				<div>
					Hasil pencarian untuk <span class="font-bold text-[#D83995]">"{searchQuery}"</span>
				</div>
			{/if}
		</div>

		<!-- Posts Grid -->
		{#if filteredPosts.length > 0}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
				{#each filteredPosts as post}
					<a
						href="/artikel/{post.slug}"
						class="group p-6 rounded-2xl bg-white dark:bg-[#0d1e30] border border-slate-200/90 dark:border-slate-800 hover:border-[#0593C6]/60 dark:hover:border-[#0593C6]/60 transition-all duration-200 shadow-xs hover:shadow-lg flex flex-col justify-between"
					>
						<div>
							<div class="flex flex-wrap items-center justify-between gap-2 mb-3">
								<span class="px-2.5 py-1 rounded-md text-xs font-semibold bg-[#0593C6]/10 text-[#0593C6]">
									{post.metadata.category}
								</span>
								<div class="flex items-center gap-1 text-xs text-slate-400">
									<Clock class="w-3.5 h-3.5 text-[#D83995]" />
									<span>{post.metadata.readTime}</span>
								</div>
							</div>

							<h2 class="text-xl font-extrabold text-slate-900 dark:text-white group-hover:text-[#0593C6] transition-colors leading-snug mb-3">
								{post.metadata.title}
							</h2>

							<p class="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4">
								{post.metadata.description}
							</p>

							{#if post.metadata.tags && post.metadata.tags.length > 0}
								<div class="flex flex-wrap gap-1.5 mb-4">
									{#each post.metadata.tags.slice(0, 3) as tag}
										<span class="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
											#{tag}
										</span>
									{/each}
								</div>
							{/if}
						</div>

						<div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
							<div class="flex items-center gap-1">
								<Calendar class="w-3.5 h-3.5 text-slate-400" />
								<span>{post.metadata.date}</span>
							</div>
							<span class="font-bold text-[#0593C6] group-hover:text-[#D83995] transition flex items-center gap-1">
								Baca artikel →
							</span>
						</div>
					</a>
				{/each}
			</div>
		{:else}
			<div class="text-center py-16 bg-white dark:bg-[#0d1e30] rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8">
				<BookOpen class="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
				<h3 class="text-lg font-bold text-slate-800 dark:text-white mb-2">Belum ada tulisan yang cocok</h3>
				<p class="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
					Tidak ada artikel dengan kata kunci "{searchQuery}" atau filter kategori yang dipilih.
				</p>
				<button
					onclick={() => { searchQuery = ''; selectedCategory = 'Semua'; }}
					class="px-4 py-2 bg-[#0593C6] text-white text-xs font-semibold rounded-lg hover:bg-[#0477a1] transition cursor-pointer"
				>
					Reset Semua Filter
				</button>
			</div>
		{/if}
	</div>
</div>
