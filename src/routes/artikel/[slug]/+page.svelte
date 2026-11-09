<script lang="ts">
	import type { PageProps } from './$types';
	import { Calendar, Clock, ArrowLeft, Share2, Check, Bookmark, AlertCircle } from '@lucide/svelte';

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
	<title>{data.metadata.title} — Adam Alhasni</title>
	<meta name="description" content={data.metadata.description} />
	<meta property="og:title" content={data.metadata.title} />
	<meta property="og:description" content={data.metadata.description} />
</svelte:head>

<div class="min-h-screen py-8 md:py-14 bg-brand-white">
	<div class="max-w-3xl mx-auto px-4 sm:px-6">
		<!-- Back Button -->
		<div class="mb-8">
			<a
				href="/artikel"
				class="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-brand-sky transition-colors group"
			>
				<ArrowLeft class="w-4 h-4 transition-transform group-hover:-translate-x-1 text-brand-sky" />
				Kembali ke Semua Tulisan
			</a>
		</div>

		<!-- Header -->
		<header class="mb-10 pb-8 border-b border-slate-200">
			<!-- Category Badge -->
			<div class="flex flex-wrap items-center gap-2 mb-4">
				<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-brand-sky/10 text-brand-sky border border-brand-sky/20">
					{data.metadata.category}
				</span>
				{#if data.metadata.featured}
					<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-brand-pink/10 text-brand-pink border border-brand-pink/20">
						★ Sorotan
					</span>
				{/if}
			</div>

			<!-- Title -->
			<h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-brand-dark leading-tight mb-6">
				{data.metadata.title}
			</h1>

			<!-- Excerpt/Lead -->
			{#if data.metadata.description}
				<p class="text-lg md:text-xl text-slate-600 leading-relaxed font-normal mb-6">
					{data.metadata.description}
				</p>
			{/if}

			<!-- Meta information bar -->
			<div class="flex flex-wrap items-center justify-between gap-4 pt-4 text-xs sm:text-sm text-slate-500">
				<div class="flex flex-wrap items-center gap-4 sm:gap-6">
					<div class="flex items-center gap-1.5 font-medium text-slate-700">
						<span class="w-7 h-7 rounded-full bg-brand-sky text-white flex items-center justify-center font-bold text-xs">
							{data.metadata.author ? data.metadata.author[0] : 'A'}
						</span>
						<span>{data.metadata.author || 'Adam Alhasni'}</span>
					</div>
					<div class="flex items-center gap-1.5">
						<Calendar class="w-4 h-4 text-brand-sky" />
						<span>{data.metadata.date}</span>
					</div>
					<div class="flex items-center gap-1.5">
						<Clock class="w-4 h-4 text-brand-pink" />
						<span>{data.metadata.readTime}</span>
					</div>
				</div>

				<!-- Share Button -->
				<button
					onclick={shareArticle}
					class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition shadow-sm text-xs font-medium cursor-pointer"
					title="Bagikan tulisan ini"
				>
					{#if copied}
						<Check class="w-3.5 h-3.5 text-emerald-600" />
						<span class="text-emerald-600">Tersalin!</span>
					{:else}
						<Share2 class="w-3.5 h-3.5 text-brand-sky" />
						<span>Bagikan</span>
					{/if}
				</button>
			</div>
		</header>

		<!-- Financial Disclaimer Callout -->
		<div class="mb-10 p-4 rounded-xl bg-sky-50/70 border border-brand-sky/20 flex items-start gap-3 text-xs sm:text-sm text-slate-700">
			<AlertCircle class="w-5 h-5 text-brand-sky shrink-0 mt-0.5" />
			<div>
				<span class="font-semibold text-brand-sky">Catatan Pembaca:</span>
				Tulisan ini merupakan opini, pemikiran, dan refleksi filosofis pribadi. Bukan merupakan nasihat keuangan atau anjuran investasi resmi. Silakan selalu lakukan riset mandiri (*do your own research*).
			</div>
		</div>

		<!-- Article Body -->
		<div class="article-content prose prose-lg prose-slate max-w-none text-slate-800 leading-relaxed
			prose-headings:text-brand-dark prose-headings:font-bold prose-headings:tracking-tight
			prose-h2:text-2xl prose-h2:sm:text-3xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-slate-100 prose-h2:pb-2
			prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-brand-sky
			prose-p:my-5 prose-p:leading-8
			prose-blockquote:border-l-4 prose-blockquote:border-brand-pink prose-blockquote:bg-brand-pink/5 prose-blockquote:py-2 prose-blockquote:px-5 prose-blockquote:rounded-r-lg prose-blockquote:italic prose-blockquote:text-slate-700
			prose-strong:text-brand-dark prose-strong:font-bold
			prose-code:text-brand-pink prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
			prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-xl prose-pre:p-5
			prose-ul:list-disc prose-ul:my-5 prose-li:my-2
			prose-table:border-collapse prose-th:bg-brand-sky/10 prose-th:text-brand-dark prose-th:p-3 prose-td:p-3 prose-td:border-b prose-td:border-slate-200">
			<ContentComponent />
		</div>

		<!-- Tags Section -->
		{#if data.metadata.tags && data.metadata.tags.length > 0}
			<div class="mt-12 pt-6 border-t border-slate-200">
				<h4 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Topik Terkait</h4>
				<div class="flex flex-wrap gap-2">
					{#each data.metadata.tags as tag}
						<span class="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 hover:border-brand-sky/40 transition">
							#{tag}
						</span>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Author Box -->
		<div class="mt-12 p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-sky-50/40 border border-slate-200 flex flex-col sm:flex-row items-center sm:items-start gap-5">
			<div class="w-16 h-16 rounded-2xl bg-brand-sky text-white flex items-center justify-center font-extrabold text-2xl shadow-md shrink-0">
				A
			</div>
			<div class="text-center sm:text-left">
				<div class="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
					<h3 class="text-lg font-bold text-brand-dark">{data.metadata.author || 'Adam Alhasni'}</h3>
					<span class="text-xs px-2 py-0.5 rounded-full bg-brand-pink/10 text-brand-pink font-semibold">Penulis</span>
				</div>
				<p class="text-sm text-slate-600 leading-relaxed mb-3">
					Menulis catatan kritis tentang bagaimana menavigasi dunia, mengelola keuangan, dan membangun otonomi waktu di tengah era yang serba bising.
				</p>
				<a href="/tentang" class="text-xs font-semibold text-brand-sky hover:text-brand-pink transition inline-flex items-center gap-1">
					Baca lebih lengkap tentang filosofi penulis →
				</a>
			</div>
		</div>

		<!-- Footer Navigation -->
		<div class="mt-10 flex items-center justify-between pt-6 border-t border-slate-200">
			<a
				href="/artikel"
				class="text-sm font-medium text-slate-600 hover:text-brand-sky transition flex items-center gap-1.5"
			>
				<ArrowLeft class="w-4 h-4" />
				Daftar Tulisan Lainnya
			</a>
			<button
				onclick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
				class="text-sm font-medium text-brand-sky hover:text-brand-pink transition"
			>
				Kembali ke Atas ↑
			</button>
		</div>
	</div>
</div>

