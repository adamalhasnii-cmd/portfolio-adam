<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';
	import {
		Calendar,
		Clock,
		ArrowLeft,
		Share2,
		Check,
		AlertCircle,
		Eye,
		X,
		Copy,
		ExternalLink,
		Smartphone,
		BarChart3
	} from '@lucide/svelte';

	let { data }: PageProps = $props();
	let copiedPlatform = $state<string | null>(null);
	let copyNotification = $state<string | null>(null);
	let showShareModal = $state(false);
	let showAdminRefModal = $state(false);
	let canNativeShare = $state(false);
	let currentBaseUrl = $state('');

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
		if (typeof window === 'undefined') return;

		canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;
		currentBaseUrl = window.location.origin + window.location.pathname;

		if (!data.slug || data.isAdmin) return;

		const urlParams = new URLSearchParams(window.location.search);
		const refParam = urlParams.get('ref');

		// Deduplication session key to allow recording different referral campaigns
		const sessionKey = `view_session_${data.slug}_${refParam || 'default'}`;
		if (sessionStorage.getItem(sessionKey)) {
			return;
		}

		const visitorId = getOrCreateVisitorId();
		fetch('/api/views', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				slug: data.slug,
				visitorId,
				ref: refParam
			})
		})
			.then((res) => {
				if (res.ok) {
					sessionStorage.setItem(sessionKey, '1');
					localStorage.setItem(`viewed_post_${data.slug}`, Date.now().toString());
				}
			})
			.catch(() => {});
	});

	function getShareUrl(platformRef: string): string {
		const base = currentBaseUrl || (typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '');
		return `${base}?ref=${platformRef}`;
	}

	function handleShareWhatsApp() {
		const targetUrl = getShareUrl('whatsapp');
		const shareText = `${data.metadata.title}\n\nBaca selengkapnya di:\n${targetUrl}`;
		const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
		window.open(waUrl, '_blank', 'noopener,noreferrer');
	}

	function handleShareTwitter() {
		const targetUrl = getShareUrl('twitter');
		const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(data.metadata.title)}&url=${encodeURIComponent(targetUrl)}`;
		window.open(twitterUrl, '_blank', 'noopener,noreferrer');
	}

	function handleShareTelegram() {
		const targetUrl = getShareUrl('telegram');
		const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(targetUrl)}&text=${encodeURIComponent(data.metadata.title)}`;
		window.open(tgUrl, '_blank', 'noopener,noreferrer');
	}

	async function copyCustomLink(platform: string, notificationMessage: string) {
		const url = getShareUrl(platform);
		try {
			await navigator.clipboard.writeText(url);
			copiedPlatform = platform;
			copyNotification = notificationMessage;
			setTimeout(() => {
				copiedPlatform = null;
				copyNotification = null;
			}, 3500);
		} catch {
			// fallback prompt
			window.prompt('Salin tautan ini:', url);
		}
	}

	function handleNativeShare() {
		if (typeof window !== 'undefined' && navigator.share) {
			navigator.share({
				title: data.metadata.title,
				text: data.metadata.description || data.metadata.title,
				url: getShareUrl('share')
			}).catch(() => {});
		}
	}

	function formatSourceName(key: string): string {
		switch (key) {
			case 'whatsapp': return 'WhatsApp';
			case 'instagram': return 'Instagram';
			case 'tiktok': return 'TikTok';
			case 'twitter': return 'X (Twitter)';
			case 'telegram': return 'Telegram';
			case 'salin_tautan': return 'Salin Tautan';
			case 'facebook': return 'Facebook';
			case 'linkedin': return 'LinkedIn';
			case 'mesin_pencari': return 'Mesin Pencari';
			case 'direct': return 'Langsung (Direct)';
			default: return key.charAt(0).toUpperCase() + key.slice(1);
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
				<!-- Draft / Archive Preview Notice -->
				{#if data.metadata.archived || data.metadata.status === 'arsip'}
					<div class="mb-5 p-3 rounded-2xl bg-purple-500/15 border border-purple-400/40 text-purple-800 dark:text-purple-200 text-xs font-bold flex items-center justify-between flex-wrap gap-2">
						<span>📦 Mode Pratinjau Arsip (Artikel ini diarsipkan dan disembunyikan dari publik)</span>
						<a href="/admin" class="underline hover:text-purple-950 dark:hover:text-white">Buka di Dashboard Admin →</a>
					</div>
				{:else if data.metadata.published === false || data.metadata.status === 'draft'}
					<div class="mb-5 p-3 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-amber-800 dark:text-amber-200 text-xs font-bold flex items-center justify-between flex-wrap gap-2">
						<span>⚠️ Mode Pratinjau Draf (Artikel ini belum dipublikasikan ke pembaca publik)</span>
						<a href="/admin" class="underline hover:text-amber-950 dark:hover:text-white">Buka di Dashboard Admin →</a>
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

						<!-- Admin Only Viewer Badge & Breakdown Trigger -->
						{#if data.isAdmin}
							<div class="flex items-center gap-1.5">
								<div
									class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0593C6]/15 text-[#0593C6] dark:bg-white/15 dark:text-sky-200 border border-[#0593C6]/30 dark:border-white/30 text-xs font-semibold"
									title="Statistik pembaca unik (hanya terlihat oleh Admin)"
								>
									<Eye class="w-3.5 h-3.5 text-[#0593C6] dark:text-sky-300" />
									<span>{data.viewCount ?? 0} pembaca unik</span>
								</div>

								{#if data.referrers && Object.keys(data.referrers).length > 0}
									<button
										type="button"
										onclick={() => (showAdminRefModal = true)}
										class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/25 transition cursor-pointer"
										title="Lihat rincian sumber pembaca artikel ini"
									>
										<BarChart3 class="w-3 h-3" />
										<span>Sumber Trafik</span>
									</button>
								{/if}
							</div>
						{/if}
					</div>

					<!-- Share Button Trigger -->
					<button
						onclick={() => (showShareModal = true)}
						class="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-pill hover:bg-[#0593C6]/15 dark:hover:bg-white/20 text-[#061a2e] dark:text-white transition shadow-sm text-xs font-bold cursor-pointer border border-[#0593C6]/30 dark:border-white/25 group"
						title="Bagikan tulisan ini ke WhatsApp, Instagram, TikTok, atau lainnya"
					>
						<Share2 class="w-4 h-4 text-[#0593C6] dark:text-white group-hover:scale-110 transition-transform" />
						<span>Bagikan</span>
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
					<span>Daftar Tulisan Lainnya</span>
				</a>

				<button
					onclick={() => (showShareModal = true)}
					class="font-semibold text-[#0593C6] dark:text-sky-300 hover:text-[#D83995] transition flex items-center gap-1.5 cursor-pointer"
				>
					<Share2 class="w-4 h-4" />
					<span>Bagikan Artikel Ini</span>
				</button>
			</div>
		</div>
	</div>
</div>

<!-- ================= SHARE MODAL (Pelmatech Glass) ================= -->
{#if showShareModal}
	<div
		class="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
		onclick={(e) => {
			if (e.target === e.currentTarget) showShareModal = false;
		}}
		role="presentation"
	>
		<div
			class="glass-panel border border-sky-200/50 dark:border-white/20 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl relative text-[#061a2e] dark:text-white my-8 animate-in fade-in zoom-in-95 duration-200"
		>
			<!-- Close button -->
			<button
				type="button"
				onclick={() => (showShareModal = false)}
				class="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-rose-500 hover:bg-white/10 dark:hover:bg-white/15 transition cursor-pointer"
				title="Tutup dialog"
			>
				<X class="w-5 h-5" />
			</button>

			<!-- Header -->
			<div class="mb-5 pr-8">
				<h3 class="text-xl font-black text-[#061a2e] dark:text-white leading-tight">
					Bagikan ke Media Sosial
				</h3>
			</div>

			<!-- Copy Notification Toast inside modal -->
			{#if copyNotification}
				<div class="mb-4 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
					<Check class="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
					<span>{copyNotification}</span>
				</div>
			{/if}

			<!-- Platform Options List -->
			<div class="space-y-2.5">
				<!-- WhatsApp -->
				<button
					type="button"
					onclick={handleShareWhatsApp}
					class="w-full p-3.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25 border border-emerald-500/30 flex items-center justify-between text-left transition group cursor-pointer"
				>
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-md shrink-0">
							<!-- WhatsApp SVG -->
							<svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
								<path d="M12.031 2C6.495 2 2 6.495 2 12.031c0 1.956.562 3.825 1.624 5.437L2 22l4.673-1.579a9.99 9.99 0 0 0 5.358 1.61h.004c5.536 0 10.031-4.495 10.031-10.031 0-2.68-1.043-5.2-2.938-7.095C17.232 3.044 14.71 2 12.031 2zm0 18.33c-1.685 0-3.333-.454-4.78-1.312l-.343-.203-3.545 1.198 1.203-3.468-.224-.356A8.307 8.307 0 0 1 3.7 12.031c0-4.595 3.736-8.331 8.331-8.331 2.227 0 4.321.868 5.896 2.443 1.575 1.575 2.443 3.669 2.443 5.896 0 4.596-3.736 8.331-8.339 8.331zm4.567-6.236c-.25-.125-1.48-.73-1.709-.813-.229-.083-.396-.125-.562.125-.167.25-.646.813-.792.98-.146.166-.292.187-.542.062-.25-.125-1.055-.389-2.01-1.24-.743-.663-1.245-1.482-1.391-1.732-.146-.25-.016-.385.109-.51.112-.112.25-.292.375-.438.125-.146.167-.25.25-.417.083-.167.042-.313-.021-.438-.062-.125-.562-1.354-.771-1.854-.203-.488-.41-.422-.562-.43-.146-.008-.313-.01-.479-.01-.167 0-.438.062-.667.313-.229.25-.875.854-.875 2.083 0 1.229.896 2.417 1.021 2.583.125.167 1.76 2.688 4.265 3.771.596.257 1.061.41 1.424.526.598.19 1.143.163 1.573.099.479-.072 1.48-.605 1.688-1.188.208-.583.208-1.083.146-1.188-.063-.104-.229-.166-.479-.291z" />
							</svg>
						</div>
						<div>
							<div class="font-bold text-sm text-[#061a2e] dark:text-white flex items-center gap-1.5">
								<span>WhatsApp</span>
								<span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold">Chat & Status</span>
							</div>
							<p class="text-xs text-[#527192] dark:text-sky-100/70">Kirim langsung ke kontak, grup, atau status WA</p>
						</div>
					</div>
					<ExternalLink class="w-4 h-4 text-emerald-600 dark:text-emerald-300 group-hover:translate-x-0.5 transition-transform" />
				</button>

				<!-- Instagram -->
				<button
					type="button"
					onclick={() => copyCustomLink('instagram', 'Tautan Instagram disalin! Siap ditempel di Sticker Link Story atau Bio profil kamu.')}
					class="w-full p-3.5 rounded-2xl bg-pink-500/10 hover:bg-pink-500/20 dark:bg-pink-500/15 dark:hover:bg-pink-500/25 border border-pink-500/30 flex items-center justify-between text-left transition group cursor-pointer"
				>
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5] text-white flex items-center justify-center shadow-md shrink-0">
							<!-- Instagram SVG -->
							<svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
								<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
							</svg>
						</div>
						<div>
							<div class="font-bold text-sm text-[#061a2e] dark:text-white flex items-center gap-1.5">
								<span>Instagram</span>
								<span class="text-[10px] px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-800 dark:text-pink-300 font-bold">Story Sticker & Bio</span>
							</div>
							<p class="text-xs text-[#527192] dark:text-sky-100/70">Salin tautan untuk Story atau Bio Instagram</p>
						</div>
					</div>
					<div class="flex items-center gap-1 text-xs font-bold text-pink-600 dark:text-pink-300">
						{#if copiedPlatform === 'instagram'}
							<Check class="w-4 h-4 text-emerald-500" />
							<span class="text-emerald-500">Tersalin!</span>
						{:else}
							<Copy class="w-4 h-4" />
							<span>Salin</span>
						{/if}
					</div>
				</button>

				<!-- TikTok -->
				<button
					type="button"
					onclick={() => copyCustomLink('tiktok', 'Tautan TikTok disalin! Siap ditempel di Bio profil akun TikTok atau komentar video.')}
					class="w-full p-3.5 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 dark:bg-cyan-500/15 dark:hover:bg-cyan-500/25 border border-cyan-500/30 flex items-center justify-between text-left transition group cursor-pointer"
				>
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shadow-md shrink-0 border border-white/20">
							<!-- TikTok SVG -->
							<svg class="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
								<path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.887 2.882 2.896 2.896 0 0 1-2.888-2.882 2.896 2.896 0 0 1 2.888-2.882c.488 0 .943.118 1.344.327V9.61a6.34 6.34 0 0 0-1.344-.145C6.071 9.465 3.2 12.336 3.2 15.872c0 3.536 2.871 6.408 6.386 6.408 3.516 0 6.387-2.872 6.387-6.408V8.98a8.218 8.218 0 0 0 4.757 1.503V7.039a4.802 4.802 0 0 1-1.141-.353z" />
							</svg>
						</div>
						<div>
							<div class="font-bold text-sm text-[#061a2e] dark:text-white flex items-center gap-1.5">
								<span>TikTok</span>
								<span class="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 font-bold">Bio & Komentar</span>
							</div>
							<p class="text-xs text-[#527192] dark:text-sky-100/70">Salin tautan untuk profil atau komentar TikTok</p>
						</div>
					</div>
					<div class="flex items-center gap-1 text-xs font-bold text-cyan-600 dark:text-cyan-300">
						{#if copiedPlatform === 'tiktok'}
							<Check class="w-4 h-4 text-emerald-500" />
							<span class="text-emerald-500">Tersalin!</span>
						{:else}
							<Copy class="w-4 h-4" />
							<span>Salin</span>
						{/if}
					</div>
				</button>

				<!-- X / Twitter -->
				<button
					type="button"
					onclick={handleShareTwitter}
					class="w-full p-3.5 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 dark:bg-white/10 dark:hover:bg-white/15 border border-sky-300/40 dark:border-white/20 flex items-center justify-between text-left transition group cursor-pointer"
				>
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md shrink-0 border border-white/20">
							<!-- X logo -->
							<svg class="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
								<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
							</svg>
						</div>
						<div>
							<div class="font-bold text-sm text-[#061a2e] dark:text-white flex items-center gap-1.5">
								<span>X (Twitter)</span>
								<span class="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-[#0593C6] dark:text-sky-300 font-bold">Tweet</span>
							</div>
							<p class="text-xs text-[#527192] dark:text-sky-100/70">Tweet langsung dengan kutipan dan tautan artikel</p>
						</div>
					</div>
					<ExternalLink class="w-4 h-4 text-[#0593C6] dark:text-white group-hover:translate-x-0.5 transition-transform" />
				</button>

				<!-- Telegram -->
				<button
					type="button"
					onclick={handleShareTelegram}
					class="w-full p-3.5 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 dark:bg-blue-500/15 dark:hover:bg-blue-500/25 border border-blue-500/30 flex items-center justify-between text-left transition group cursor-pointer"
				>
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 rounded-xl bg-[#229ED9] text-white flex items-center justify-center shadow-md shrink-0">
							<!-- Telegram SVG -->
							<svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
								<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.12.03-1.97 1.25-5.56 3.69-.53.36-1.01.54-1.44.53-.47-.01-1.38-.27-2.06-.49-.83-.27-1.49-.42-1.43-.88.03-.24.38-.49 1.04-.75 4.08-1.78 6.81-2.95 8.19-3.53 3.9-1.63 4.71-1.91 5.24-1.92.12 0 .37.03.54.17.14.12.18.28.2.45-.01.07.01.21 0 .28z" />
							</svg>
						</div>
						<div>
							<div class="font-bold text-sm text-[#061a2e] dark:text-white flex items-center gap-1.5">
								<span>Telegram</span>
								<span class="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-800 dark:text-blue-300 font-bold">Kanal & Grup</span>
							</div>
							<p class="text-xs text-[#527192] dark:text-sky-100/70">Kirim langsung ke kontak, grup, atau kanal Telegram</p>
						</div>
					</div>
					<ExternalLink class="w-4 h-4 text-[#229ED9] group-hover:translate-x-0.5 transition-transform" />
				</button>

				<!-- Salin Tautan Umum -->
				<button
					type="button"
					onclick={() => copyCustomLink('salin_tautan', 'Tautan artikel disalin ke papan klip!')}
					class="w-full p-3.5 rounded-2xl bg-sky-500/5 hover:bg-sky-500/15 dark:bg-white/5 dark:hover:bg-white/10 border border-sky-200/50 dark:border-white/15 flex items-center justify-between text-left transition group cursor-pointer"
				>
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0593C6] to-[#D83995] text-white flex items-center justify-center shadow-md shrink-0">
							<Copy class="w-5 h-5 text-white" />
						</div>
						<div>
							<div class="font-bold text-sm text-[#061a2e] dark:text-white flex items-center gap-1.5">
								<span>Salin Tautan Umum</span>
							</div>
							<p class="text-xs text-[#527192] dark:text-sky-100/70">Salin tautan langsung ke papan klip</p>
						</div>
					</div>
					<div class="flex items-center gap-1 text-xs font-bold text-[#0593C6] dark:text-sky-300">
						{#if copiedPlatform === 'salin_tautan'}
							<Check class="w-4 h-4 text-emerald-500" />
							<span class="text-emerald-500">Tersalin!</span>
						{:else}
							<Copy class="w-4 h-4" />
							<span>Salin</span>
						{/if}
					</div>
				</button>
			</div>

			<!-- Mobile Native Share Button (if supported) -->
			{#if canNativeShare}
				<div class="mt-4 pt-4 border-t border-sky-100/60 dark:border-white/10">
					<button
						type="button"
						onclick={handleNativeShare}
						class="w-full py-2.5 px-4 rounded-xl border border-sky-200/60 dark:border-white/20 text-xs font-semibold text-[#061a2e] dark:text-white hover:bg-sky-500/10 dark:hover:bg-white/15 transition flex items-center justify-center gap-2 cursor-pointer"
					>
						<Smartphone class="w-4 h-4 text-[#0593C6] dark:text-sky-300" />
						<span>Gunakan Menu Berbagi Bawaan Perangkat</span>
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}

<!-- ================= ADMIN REFERRAL BREAKDOWN MODAL ================= -->
{#if showAdminRefModal && data.isAdmin}
	<div
		class="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
		onclick={(e) => {
			if (e.target === e.currentTarget) showAdminRefModal = false;
		}}
		role="presentation"
	>
		<div
			class="glass-panel border border-sky-200/50 dark:border-white/20 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative text-[#061a2e] dark:text-white my-8 animate-in fade-in zoom-in-95 duration-200"
		>
			<button
				type="button"
				onclick={() => (showAdminRefModal = false)}
				class="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-rose-500 hover:bg-white/10 dark:hover:bg-white/15 transition cursor-pointer"
			>
				<X class="w-5 h-5" />
			</button>

			<div class="mb-5 pr-8">
				<div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-2">
					<BarChart3 class="w-3.5 h-3.5" />
					<span>Statistik Sumber Rujukan (Admin)</span>
				</div>
				<h3 class="text-lg font-black text-[#061a2e] dark:text-white">
					Asal Pembaca Artikel Ini
				</h3>
				<p class="text-xs text-[#527192] dark:text-sky-100/70 mt-1">
					Rincian platform dari tautan yang dibuka pembaca:
				</p>
			</div>

			<div class="space-y-2 mb-6">
				{#each Object.entries(data.referrers || {}) as [source, count]}
					<div class="flex items-center justify-between p-3 rounded-xl bg-sky-500/5 dark:bg-white/5 border border-sky-200/50 dark:border-white/10 text-xs">
						<span class="font-bold text-[#061a2e] dark:text-white">{formatSourceName(source)}</span>
						<span class="px-2.5 py-0.5 rounded-full bg-[#0593C6]/20 text-[#0593C6] dark:text-sky-200 font-extrabold">{count} pembaca</span>
					</div>
				{:else}
					<p class="text-xs text-slate-400 italic text-center py-4">Belum ada pembaca lewat tautan rujukan tercatat.</p>
				{/each}
			</div>

			<div class="pt-3 border-t border-sky-100/60 dark:border-white/10 flex justify-between items-center text-xs">
				<span class="text-slate-500 dark:text-slate-400">Total Pembaca Unik:</span>
				<span class="font-black text-sm text-[#0593C6] dark:text-white">{data.viewCount ?? 0}</span>
			</div>
		</div>
	</div>
{/if}
