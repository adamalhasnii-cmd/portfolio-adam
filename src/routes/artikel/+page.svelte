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

<div class="py-8 sm:py-14 text-white">
	<div class="max-w-6xl mx-auto px-4 sm:px-6">
		<!-- Header -->
		<div class="max-w-2xl mb-10">
			<div
				class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-pill text-white text-xs font-semibold mb-4 shadow-xs"
			>
				<BookOpen class="w-3.5 h-3.5 text-white" />
				<span>Koleksi Lengkap</span>
			</div>
			<h1
				class="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4 drop-shadow-sm"
			>
				Semua Pemikiran & Tulisan
			</h1>
			<p class="text-sky-50/90 text-base sm:text-lg leading-relaxed font-normal">
				Eksplorasi sudut pandang tentang bagaimana uang bekerja, cara mempertahankan modal dari badai
				ekonomi, dan memilih keputusan rasional di masa depan.
			</p>
		</div>

		<!-- Search & Category Filters Bar -->
		<div class="space-y-6 mb-10 pb-8 border-b border-white/20">
			<!-- Search Bar -->
			<div class="relative max-w-xl">
				<Search class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/70" />
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Cari judul artikel, topik, atau kata kunci..."
					class="w-full pl-12 pr-4 py-3.5 rounded-full glass-panel text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm shadow-md transition"
				/>
				{#if searchQuery}
					<button
						onclick={() => (searchQuery = '')}
						class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-full text-white transition cursor-pointer"
					>
						Hapus
					</button>
				{/if}
			</div>

			<!-- Category Pills -->
			<div class="flex flex-wrap items-center gap-2">
				<div
					class="flex items-center gap-1.5 text-xs font-bold text-white/80 uppercase tracking-wider mr-2"
				>
					<Filter class="w-3.5 h-3.5" />
					<span>Kategori:</span>
				</div>
				{#each categories as category}
					<button
						onclick={() => (selectedCategory = category)}
						class="px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer {selectedCategory ===
						category
							? 'bg-white text-[#0593C6] shadow-lg shadow-black/10 scale-105'
							: 'glass-pill text-white hover:bg-white/25'}"
					>
						{category}
					</button>
				{/each}
			</div>
		</div>

		<!-- Posts Counter -->
		<div
			class="flex items-center justify-between text-xs sm:text-sm text-sky-100/80 mb-6 font-medium"
		>
			<div>
				Menampilkan <span class="font-bold text-white">{filteredPosts.length}</span> tulisan
				{#if selectedCategory !== 'Semua'}
					dalam kategori <span class="font-bold text-white">"{selectedCategory}"</span>
				{/if}
			</div>
			{#if searchQuery}
				<div>
					Hasil pencarian untuk <span class="font-bold text-pink-200">"{searchQuery}"</span>
				</div>
			{/if}
		</div>

		<!-- Posts Grid -->
		{#if filteredPosts.length > 0}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
				{#each filteredPosts as post}
					<a
						href="/artikel/{post.slug}"
						class="group p-6 rounded-3xl glass-panel hover:bg-white/18 hover:border-white/40 transition-all duration-300 shadow-xl flex flex-col justify-between"
					>
						<div>
							<div class="flex flex-wrap items-center justify-between gap-2 mb-3">
								<span
									class="px-3 py-1 rounded-full text-xs font-semibold glass-pill text-white group-hover:bg-[#D83995] transition-colors"
								>
									{post.metadata.category}
								</span>
								<div class="flex items-center gap-1 text-xs text-sky-100/80">
									<Clock class="w-3.5 h-3.5 text-pink-200" />
									<span>{post.metadata.readTime}</span>
								</div>
							</div>

							<h2
								class="text-xl font-black text-white group-hover:text-pink-200 transition-colors leading-snug mb-3 drop-shadow-sm"
							>
								{post.metadata.title}
							</h2>

							<p class="text-sm text-sky-50/85 line-clamp-3 leading-relaxed mb-4 font-normal">
								{post.metadata.description}
							</p>

							{#if post.metadata.tags && post.metadata.tags.length > 0}
								<div class="flex flex-wrap gap-1.5 mb-4">
									{#each post.metadata.tags.slice(0, 3) as tag}
										<span
											class="text-[11px] font-medium text-white/80 bg-white/10 px-2.5 py-0.5 rounded-full"
										>
											#{tag}
										</span>
									{/each}
								</div>
							{/if}
						</div>

						<div
							class="pt-4 border-t border-white/15 flex items-center justify-between text-xs text-sky-100/75"
						>
							<div class="flex items-center gap-1">
								<Calendar class="w-3.5 h-3.5" />
								<span>{post.metadata.date}</span>
							</div>
							<span
								class="font-bold text-white group-hover:text-pink-200 transition flex items-center gap-1"
							>
								Baca artikel →
							</span>
						</div>
					</a>
				{/each}
			</div>
		{:else}
			<div class="text-center py-16 glass-panel rounded-3xl border border-white/20 p-8 text-white">
				<BookOpen class="w-12 h-12 text-white/50 mx-auto mb-4" />
				<h3 class="text-lg font-bold text-white mb-2">Belum ada tulisan yang cocok</h3>
				<p class="text-sm text-sky-100/80 max-w-sm mx-auto mb-6">
					Tidak ada artikel dengan kata kunci "{searchQuery}" atau filter kategori yang dipilih.
				</p>
				<button
					onclick={() => {
						searchQuery = '';
						selectedCategory = 'Semua';
					}}
					class="px-6 py-2.5 bg-white text-[#0593C6] font-bold text-xs rounded-full hover:bg-white/90 shadow-md transition cursor-pointer"
				>
					Reset Semua Filter
				</button>
			</div>
		{/if}
	</div>
</div>
