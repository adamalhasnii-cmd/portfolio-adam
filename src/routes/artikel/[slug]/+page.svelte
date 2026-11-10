<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';
	import { Calendar, Clock, ArrowLeft, Share2, Check, AlertCircle, Eye } from '@lucide/svelte';

	let { data }: PageProps = $props();
	let copied = $state(false);

	const ContentComponent = $derived(data.component);

	function getOrCreateVisitorId(): string {
		if (typeof window === 'undefined') return '';
		let id = localStorage.getItem('portfolio_vid');
		if (!id) {
			id = 'vid_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
			localStorage.setItem('portfolio_vid', id);
		}
		return id;
	}

	onMount(() => {
		if (typeof window === 'undefined' || !data.slug) return;

		// Deduplication check: prevent duplicate counting if visited in this browser
		const viewKey = `viewed_post_${data.slug}`;
		if (localStorage.getItem(viewKey)) {
			return;
		}

		const visitorId = getOrCreateVisitorId();
		fetch('/api/views', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ slug: data.slug, visitorId })
		})
			.then((res) => {
				if (res.ok) {
					localStorage.setItem(viewKey, Date.now().toString());
				}
			})
			.catch(() => {});
	});

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

<div class="min-h-screen py-6 md:py-12 text-[#061a2e] dark:text-white">
	<div class="max-w-4xl mx-auto px-4 sm:px-6">
		<!-- Back Button -->
		<div class="mb-6">
			<a
				href="/artikel"
				class="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold glass-pill px-4 py-2 rounded-full text-[#061a2e] dark:text-white hover:bg-sky-500/10 dark:hover:bg-white/25 transition-all group"
			>
				<ArrowLeft class="w-4 h-4 transition-transform group-hover:-translate-x-1" />
				<span>Kembali ke Semua Tulisan</span>
			</a>
		</div>

		<!-- Frosted Glass Article Container -->
		<div class="glass-panel rounded-3xl p-6 sm:p-12 text-[#061a2e] dark:text-white shadow-2xl relative overflow-hidden border border-sky-200/60 dark:border-white/20">
			<!-- Top Sheen -->
			<div class="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/25 dark:from-white/15 to-transparent pointer-events-none rounded-t-3xl"></div>

			<!-- Header -->
			<header class="mb-10 pb-8 border-b border-sky-200/50 dark:border-white/20 relative z-10">
				<!-- Draft Preview Notice -->
				{#if data.metadata.published === false}
					<div class="mb-5 p-3 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-amber-800 dark:text-amber-200 text-xs font-bold flex items-center justify-between flex-wrap gap-2">
						<span>⚠️ Mode Pratinjau Draf (Artikel ini belum dipublikasikan ke pembaca publik)</span>
						<a href="/admin" class="underline hover:text-amber-950 dark:hover:text-white">Buka di Editor Admin →</a>
					</div>
				{/if}

				<!-- Category Badge -->
				<div class="flex flex-wrap items-center gap-2 mb-4">
					<span
						class="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold bg-[#0593C6] text-white dark:bg-white dark:text-[#0593C6] shadow-sm"
					>
						{data.metadata.category}
					</span>
					{#if data.metadata.featured}
						<span
							class="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold bg-[#D83995] text-white shadow-sm shadow-[#D83995]/40"
						>
							★ Sorotan
						</span>
					{/if}
				</div>

				<!-- Title -->
				<h1
					class="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#061a2e] dark:text-white leading-tight mb-6 drop-shadow-xs"
				>
					{data.metadata.title}
				</h1>

				<!-- Excerpt/Lead -->
				{#if data.metadata.description}
					<p class="text-lg md:text-xl text-[#274362] dark:text-sky-50/90 leading-relaxed font-normal mb-6">
						{data.metadata.description}
					</p>
				{/if}

				<!-- Meta information bar -->
				<div
					class="flex flex-wrap items-center justify-between gap-4 pt-4 text-xs sm:text-sm text-[#516f8e] dark:text-sky-100/80"
				>
					<div class="flex flex-wrap items-center gap-4 sm:gap-6">
						<div class="flex items-center gap-2 font-semibold text-[#061a2e] dark:text-white">
							<span
								class="w-7 h-7 rounded-full bg-[#0593C6]/15 dark:bg-white/25 border border-[#0593C6]/30 dark:border-white/30 text-[#0593C6] dark:text-white flex items-center justify-center font-bold text-xs"
							>
								{data.metadata.author ? data.metadata.author[0] : '9'}
							</span>
							<span>{data.metadata.author || '911'}</span>
						</div>
						<div class="flex items-center gap-1.5">
							<Calendar class="w-4 h-4 text-[#0593C6] dark:text-white/80" />
							<span>{data.metadata.date}</span>
						</div>
						<div class="flex items-center gap-1.5">
							<Clock class="w-4 h-4 text-[#D83995] dark:text-pink-200" />
							<span>{data.metadata.readTime}</span>
						</div>

						<!-- Admin Only Viewer Badge -->
						{#if data.isAdmin}
							<div
								class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0593C6]/15 text-[#0593C6] dark:bg-white/15 dark:text-sky-200 border border-[#0593C6]/30 dark:border-white/30 text-xs font-semibold"
								title="Statistik pembaca unik (hanya terlihat oleh Admin)"
							>
								<Eye class="w-3.5 h-3.5 text-[#0593C6] dark:text-sky-300" />
								<span>{data.viewCount ?? 0} pembaca unik</span>
							</div>
						{/if}
					</div>

					<!-- Share Button -->
					<button
						onclick={shareArticle}
						class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full glass-pill hover:bg-sky-500/10 dark:hover:bg-white/25 text-[#061a2e] dark:text-white transition shadow-sm text-xs font-semibold cursor-pointer"
						title="Bagikan tulisan ini"
					>
						{#if copied}
							<Check class="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-300" />
							<span class="text-emerald-600 dark:text-emerald-300 font-bold">Tersalin!</span>
						{:else}
							<Share2 class="w-3.5 h-3.5" />
							<span>Bagikan</span>
						{/if}
					</button>
				</div>
			</header>

			<!-- Financial Disclaimer Callout -->
			<div
				class="mb-10 p-4 rounded-2xl bg-sky-50 dark:bg-white/10 border border-sky-200/80 dark:border-white/20 flex items-start gap-3 text-xs sm:text-sm text-[#223d5a] dark:text-sky-50/90 relative z-10"
			>
				<AlertCircle class="w-5 h-5 text-[#0593C6] dark:text-white shrink-0 mt-0.5" />
				<div>
					<span class="font-bold text-[#061a2e] dark:text-white">Catatan Pembaca:</span>
					Tulisan ini merupakan opini, pemikiran, dan refleksi filosofis pribadi. Bukan merupakan
					nasihat keuangan atau anjuran investasi resmi. Silakan selalu lakukan riset mandiri (*do
					your own research*).
				</div>
			</div>

			<!-- Article Body -->
			<div
				class="article-content prose prose-lg dark:prose-invert max-w-none leading-relaxed relative z-10
				text-[#1a324b] dark:text-sky-100/90
				prose-headings:text-[#061a2e] dark:prose-headings:text-white prose-headings:font-black prose-headings:tracking-tight
				prose-h2:text-2xl prose-h2:sm:text-3xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-sky-200/50 dark:prose-h2:border-white/15 prose-h2:pb-2
				prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-[#0593C6] dark:prose-h3:text-pink-200
				prose-p:my-5 prose-p:leading-8 prose-p:text-[#243d57] dark:prose-p:text-sky-50/90 font-normal
				prose-blockquote:border-l-4 prose-blockquote:border-[#D83995] prose-blockquote:bg-[#D83995]/8 dark:prose-blockquote:bg-white/10 prose-blockquote:py-3 prose-blockquote:px-5 prose-blockquote:rounded-r-2xl prose-blockquote:italic prose-blockquote:text-[#183049] dark:prose-blockquote:text-white
				prose-code:text-[#D83995] prose-code:bg-sky-500/10 dark:prose-code:bg-white/15 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm font-semibold
				prose-pre:bg-[#071626] prose-pre:border prose-pre:border-sky-200/20 dark:prose-pre:border-white/20 prose-pre:text-slate-100 prose-pre:rounded-2xl prose-pre:p-5
				prose-ul:list-disc prose-ul:my-5 prose-li:my-2 prose-li:text-[#243d57] dark:prose-li:text-sky-50/90
				prose-table:border-collapse prose-th:bg-sky-500/10 dark:prose-th:bg-white/10 prose-th:p-3 prose-td:p-3 prose-td:border-b prose-td:border-sky-200/50 dark:prose-td:border-white/15"
			>
				<ContentComponent />
			</div>

			<!-- Tags Section -->
			{#if data.metadata.tags && data.metadata.tags.length > 0}
				<div class="mt-12 pt-6 border-t border-sky-200/50 dark:border-white/20 relative z-10">
					<h4 class="text-xs font-bold text-[#516f8e] dark:text-sky-100/70 uppercase tracking-wider mb-3">
						Topik Terkait
					</h4>
					<div class="flex flex-wrap gap-2">
						{#each data.metadata.tags as tag}
							<span
								class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold glass-pill text-[#0593C6] dark:text-white"
							>
								#{tag}
							</span>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Author Box -->
			<div
				class="mt-12 p-6 rounded-2xl bg-sky-500/5 dark:bg-white/10 border border-sky-200/60 dark:border-white/20 flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10 text-[#061a2e] dark:text-white"
			>
				<div
					class="w-14 h-14 rounded-2xl bg-[#0593C6] text-white dark:bg-white dark:text-[#0593C6] flex items-center justify-center font-black text-2xl shadow-lg shrink-0"
				>
					911
				</div>
				<div class="text-center sm:text-left">
					<div class="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
						<h3 class="text-lg font-bold text-[#061a2e] dark:text-white">{data.metadata.author || '911'}</h3>
						<span class="text-xs px-2.5 py-0.5 rounded-full bg-[#D83995] text-white font-bold"
							>Penulis</span
						>
					</div>
					<p class="text-sm text-[#33506f] dark:text-sky-50/85 leading-relaxed mb-3 font-normal">
						Menulis catatan kritis tentang bagaimana menavigasi dunia, mengelola keuangan, dan
						membangun otonomi waktu di tengah era yang serba bising.
					</p>
					<a
						href="/tentang"
						class="text-xs font-bold text-[#0593C6] dark:text-white hover:text-[#D83995] dark:hover:text-pink-200 transition inline-flex items-center gap-1"
					>
						Baca lebih lengkap tentang filosofi penulis →
					</a>
				</div>
			</div>

			<!-- Footer Navigation Inside Article -->
			<div
				class="mt-10 flex items-center justify-between pt-6 border-t border-sky-200/50 dark:border-white/20 text-xs sm:text-sm relative z-10"
			>
				<a
					href="/artikel"
					class="font-semibold text-[#0593C6] dark:text-white hover:text-[#D83995] dark:hover:text-pink-200 transition flex items-center gap-1.5"
				>
					<ArrowLeft class="w-4 h-4" />
					Daftar Tulisan Lainnya
				</a>
				<button
					onclick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
					class="font-semibold text-[#516f8e] dark:text-white hover:text-[#0593C6] dark:hover:text-pink-200 transition cursor-pointer"
				>
					Kembali ke Atas ↑
				</button>
			</div>
		</div>
	</div>
</div>
