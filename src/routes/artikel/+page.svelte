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

<div class="py-8 sm:py-14 text-[#061a2e] dark:text-white">
	<div class="max-w-6xl mx-auto px-4 sm:px-6">
		<!-- Header -->
		<div class="max-w-2xl mb-10">
			<div
				class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-pill text-[#0593C6] dark:text-white text-xs font-bold mb-4 shadow-xs"
			>
				<BookOpen class="w-3.5 h-3.5 text-[#0593C6] dark:text-white" />
				<span>Koleksi Lengkap</span>
			</div>
			<h1
				class="text-3xl sm:text-4xl md:text-5xl font-black text-[#061a2e] dark:text-white tracking-tight leading-tight mb-4 drop-shadow-xs"
			>
				Semua Pemikiran & Tulisan
			</h1>
			<p class="text-[#2e4a68] dark:text-sky-50/90 text-base sm:text-lg leading-relaxed font-normal">
				Eksplorasi sudut pandang tentang bagaimana uang bekerja, cara mempertahankan modal dari badai
				ekonomi, dan memilih keputusan rasional di masa depan.
			</p>
		</div>

		<!-- Search & Category Filters Bar -->
		<div class="space-y-6 mb-10 pb-8 border-b border-sky-200/50 dark:border-white/20">
			<!-- Search Bar -->
			<div class="relative max-w-xl">
				<Search class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#0593C6] dark:text-white/70" />
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Cari judul artikel, topik, atau kata kunci..."
					class="w-full pl-12 pr-4 py-3.5 rounded-full glass-panel text-[#061a2e] dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#0593C6] dark:focus:ring-white/50 border border-sky-200/60 dark:border-white/20 text-sm shadow-md transition"
				/>
				{#if searchQuery}
					<button
						onclick={() => (searchQuery = '')}
						class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold px-2.5 py-1 bg-sky-500/10 dark:bg-white/20 hover:bg-sky-500/20 dark:hover:bg-white/30 rounded-full text-[#061a2e] dark:text-white transition cursor-pointer"
					>
						Hapus
					</button>
				{/if}
			</div>

			<!-- Category Pills -->
			<div class="flex flex-wrap items-center gap-2">
				<div
					class="flex items-center gap-1.5 text-xs font-bold text-[#334e6b] dark:text-white/80 uppercase tracking-wider mr-2"
				>
					<Filter class="w-3.5 h-3.5" />
					<span>Kategori:</span>
				</div>
				{#each categories as category}
					<button
						onclick={() => (selectedCategory = category)}
						class="px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer {selectedCategory ===
						category
							? 'bg-[#0593C6] text-white dark:bg-white dark:text-[#0593C6] shadow-md shadow-[#0593C6]/25 dark:shadow-black/10 scale-105'
							: 'glass-pill text-[#334e6b] dark:text-white hover:bg-sky-500/10 dark:hover:bg-white/25'}"
					>
						{category}
					</button>
				{/each}
			</div>
		</div>

		<!-- Posts Counter -->
		<div
			class="flex items-center justify-between text-xs sm:text-sm text-[#516f8e] dark:text-sky-100/80 mb-6 font-medium"
		>
			<div>
				Menampilkan <span class="font-bold text-[#061a2e] dark:text-white">{filteredPosts.length}</span> tulisan
				{#if selectedCategory !== 'Semua'}
					dalam kategori <span class="font-bold text-[#061a2e] dark:text-white">"{selectedCategory}"</span>
				{/if}
			</div>
			{#if searchQuery}
				<div>
					Hasil pencarian untuk <span class="font-bold text-[#D83995] dark:text-pink-200">"{searchQuery}"</span>
				</div>
			{/if}
		</div>

		<!-- Posts Grid -->
		{#if filteredPosts.length > 0}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
				{#each filteredPosts as post}
					<a
						href="/artikel/{post.slug}"
						class="group p-6 rounded-3xl glass-panel hover:border-[#0593C6]/40 dark:hover:border-white/40 transition-all duration-300 shadow-lg flex flex-col justify-between text-[#061a2e] dark:text-white"
					>
						<div>
							<div class="flex flex-wrap items-center justify-between gap-2 mb-3">
								<span
									class="px-3 py-1 rounded-full text-xs font-semibold glass-pill text-[#0593C6] dark:text-white group-hover:bg-[#D83995] group-hover:text-white transition-colors"
								>
									{post.metadata.category}
								</span>
								<div class="flex items-center gap-1 text-xs text-[#516f8e] dark:text-sky-100/80">
									<Clock class="w-3.5 h-3.5 text-[#D83995]" />
									<span>{post.metadata.readTime}</span>
								</div>
							</div>

							<h2
								class="text-xl font-black text-[#061a2e] dark:text-white group-hover:text-[#0593C6] dark:group-hover:text-pink-200 transition-colors leading-snug mb-3"
							>
								{post.metadata.title}
							</h2>

							<p class="text-sm text-[#33506f] dark:text-sky-50/85 line-clamp-3 leading-relaxed mb-4 font-normal">
								{post.metadata.description}
							</p>

							{#if post.metadata.tags && post.metadata.tags.length > 0}
								<div class="flex flex-wrap gap-1.5 mb-4">
									{#each post.metadata.tags.slice(0, 3) as tag}
										<span
											class="text-[11px] font-semibold text-[#0593C6] dark:text-white/80 bg-sky-500/10 dark:bg-white/10 px-2.5 py-0.5 rounded-full"
										>
											#{tag}
										</span>
									{/each}
								</div>
							{/if}
						</div>

						<div
							class="pt-4 border-t border-sky-100 dark:border-white/15 flex items-center justify-between text-xs text-[#516f8e] dark:text-sky-100/75"
						>
							<div class="flex items-center gap-1">
								<Calendar class="w-3.5 h-3.5 text-[#0593C6] dark:text-sky-300" />
								<span>{post.metadata.date}</span>
							</div>
							<span
								class="font-bold text-[#0593C6] dark:text-white group-hover:text-[#D83995] dark:group-hover:text-pink-200 transition flex items-center gap-1"
							>
								Baca artikel →
							</span>
						</div>
					</a>
				{/each}
			</div>
		{:else}
			<div class="text-center py-16 glass-panel rounded-3xl border border-sky-200/60 dark:border-white/20 p-8 text-[#061a2e] dark:text-white">
				<BookOpen class="w-12 h-12 text-[#0593C6]/60 dark:text-white/50 mx-auto mb-4" />
				<h3 class="text-lg font-bold text-[#061a2e] dark:text-white mb-2">Belum ada tulisan yang cocok</h3>
				<p class="text-sm text-[#33506f] dark:text-sky-100/80 max-w-sm mx-auto mb-6">
					Tidak ada artikel dengan kata kunci "{searchQuery}" atau filter kategori yang dipilih.
				</p>
				<button
					onclick={() => {
						searchQuery = '';
						selectedCategory = 'Semua';
					}}
					class="px-6 py-2.5 bg-[#0593C6] text-white hover:bg-[#047ea8] dark:bg-white dark:text-[#0593C6] font-bold text-xs rounded-full shadow-md transition cursor-pointer"
				>
					Reset Semua Filter
				</button>
			</div>
		{/if}
	</div>
</div>
