<script lang="ts">
	import type { PageProps } from './$types';
	import { Calendar, Clock, ArrowLeft, Share2, Check, AlertCircle } from '@lucide/svelte';

	let { data }: PageProps = $props();
	let copied = $state(false);

	const ContentComponent = $derived(data.component);

	function shareArticle() {
		if (typeof window !== 'undefined') {
			if (navigator.share) {
				navigator.share({
					title: data.metadata.title,
					text: data.metadata.description,
					url: window.location.href
				}).catch(() => {});
			} else {
				navigator.clipboard.writeText(window.location.href);
				copied = true;
				setTimeout(() => {
					copied = false;
				}, 2000);
			}
		}
	}
</script>

<svelte:head>
	<title>{data.metadata.title} — 911</title>
	<meta name="description" content={data.metadata.description} />
	<meta property="og:title" content={data.metadata.title} />
	<meta property="og:description" content={data.metadata.description} />
</svelte:head>

<div class="min-h-screen py-8 md:py-14 bg-[#FCFFFF] dark:bg-[#07121e] transition-colors">
	<div class="max-w-3xl mx-auto px-4 sm:px-6">
		<!-- Back Button -->
		<div class="mb-8">
			<a
				href="/artikel"
				class="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-[#0593C6] dark:hover:text-[#0593C6] transition-colors group"
			>
				<ArrowLeft class="w-4 h-4 transition-transform group-hover:-translate-x-1 text-[#0593C6]" />
				Kembali ke Semua Tulisan
			</a>
		</div>

		<!-- Header -->
		<header class="mb-10 pb-8 border-b border-slate-200 dark:border-slate-800">
			<!-- Category Badge -->
			<div class="flex flex-wrap items-center gap-2 mb-4">
				<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#0593C6]/10 text-[#0593C6] border border-[#0593C6]/20">
					{data.metadata.category}
				</span>
				{#if data.metadata.featured}
					<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#D83995]/10 text-[#D83995] border border-[#D83995]/20">
						★ Sorotan
					</span>
				{/if}
			</div>

			<!-- Title -->
			<h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight mb-6">
				{data.metadata.title}
			</h1>

			<!-- Excerpt/Lead -->
			{#if data.metadata.description}
				<p class="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-normal mb-6">
					{data.metadata.description}
				</p>
			{/if}

			<!-- Meta information bar -->
			<div class="flex flex-wrap items-center justify-between gap-4 pt-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
				<div class="flex flex-wrap items-center gap-4 sm:gap-6">
					<div class="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
						<span class="w-7 h-7 rounded-full bg-[#0593C6] text-white flex items-center justify-center font-bold text-xs">
							{data.metadata.author ? data.metadata.author[0] : 'A'}
						</span>
						<span>{data.metadata.author || '911'}</span>
					</div>
					<div class="flex items-center gap-1.5">
						<Calendar class="w-4 h-4 text-[#0593C6]" />
						<span>{data.metadata.date}</span>
					</div>
					<div class="flex items-center gap-1.5">
						<Clock class="w-4 h-4 text-[#D83995]" />
						<span>{data.metadata.readTime}</span>
					</div>
				</div>

				<!-- Share Button -->
				<button
					onclick={shareArticle}
					class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1e30] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition shadow-sm text-xs font-medium cursor-pointer"
					title="Bagikan tulisan ini"
				>
					{#if copied}
						<Check class="w-3.5 h-3.5 text-emerald-600" />
						<span class="text-emerald-600">Tersalin!</span>
					{:else}
						<Share2 class="w-3.5 h-3.5 text-[#0593C6]" />
						<span>Bagikan</span>
					{/if}
				</button>
			</div>
		</header>

		<!-- Financial Disclaimer Callout -->
		<div class="mb-10 p-4 rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-[#0593C6]/20 flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
			<AlertCircle class="w-5 h-5 text-[#0593C6] shrink-0 mt-0.5" />
			<div>
				<span class="font-semibold text-[#0593C6]">Catatan Pembaca:</span>
				Tulisan ini merupakan opini, pemikiran, dan refleksi filosofis pribadi. Bukan merupakan nasihat keuangan atau anjuran investasi resmi. Silakan selalu lakukan riset mandiri (*do your own research*).
			</div>
		</div>

		<!-- Article Body -->
		<div class="article-content prose prose-lg prose-slate dark:prose-invert max-w-none leading-relaxed
			prose-headings:text-slate-900 dark:prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight
			prose-h2:text-2xl prose-h2:sm:text-3xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-slate-100 dark:prose-h2:border-slate-800 prose-h2:pb-2
			prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-[#0593C6]
			prose-p:my-5 prose-p:leading-8
			prose-blockquote:border-l-4 prose-blockquote:border-[#D83995] prose-blockquote:bg-[#D83995]/5 prose-blockquote:py-2 prose-blockquote:px-5 prose-blockquote:rounded-r-lg prose-blockquote:italic
			prose-code:text-[#D83995] prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
			prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-xl prose-pre:p-5
			prose-ul:list-disc prose-ul:my-5 prose-li:my-2
			prose-table:border-collapse prose-th:bg-[#0593C6]/10 prose-th:p-3 prose-td:p-3 prose-td:border-b prose-td:border-slate-200 dark:prose-td:border-slate-800">
			<ContentComponent />
		</div>

		<!-- Tags Section -->
		{#if data.metadata.tags && data.metadata.tags.length > 0}
			<div class="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800">
				<h4 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Topik Terkait</h4>
				<div class="flex flex-wrap gap-2">
					{#each data.metadata.tags as tag}
						<span class="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-[#0593C6]/40 transition">
							#{tag}
						</span>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Author Box -->
		<div class="mt-12 p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-sky-50/40 dark:from-[#0d1e30] dark:to-[#081726] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center sm:items-start gap-5">
			<div class="w-16 h-16 rounded-2xl bg-[#0593C6] text-white flex items-center justify-center font-extrabold text-2xl shadow-md shrink-0">
				A
			</div>
			<div class="text-center sm:text-left">
				<div class="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
					<h3 class="text-lg font-bold text-slate-900 dark:text-white">{data.metadata.author || '911'}</h3>
					<span class="text-xs px-2 py-0.5 rounded-full bg-[#D83995]/10 text-[#D83995] font-semibold">Penulis</span>
				</div>
				<p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
					Menulis catatan kritis tentang bagaimana menavigasi dunia, mengelola keuangan, dan membangun otonomi waktu di tengah era yang serba bising.
				</p>
				<a href="/tentang" class="text-xs font-semibold text-[#0593C6] hover:text-[#D83995] transition inline-flex items-center gap-1">
					Baca lebih lengkap tentang filosofi penulis →
				</a>
			</div>
		</div>

		<!-- Footer Navigation -->
		<div class="mt-10 flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
			<a
				href="/artikel"
				class="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-[#0593C6] transition flex items-center gap-1.5"
			>
				<ArrowLeft class="w-4 h-4" />
				Daftar Tulisan Lainnya
			</a>
			<button
				onclick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
				class="text-sm font-medium text-[#0593C6] hover:text-[#D83995] transition cursor-pointer"
			>
				Kembali ke Atas ↑
			</button>
		</div>
	</div>
</div>
