<script lang="ts">
	import type { PageProps } from './$types';
	import {
		ArrowRight,
		BookOpen,
		Clock,
		Calendar,
		Sparkles,
		TrendingUp,
		ShieldCheck,
		Compass,
		User,
		Flame,
		Radio
	} from '@lucide/svelte';

	let { data }: PageProps = $props();

	const posts = $derived(data.posts || []);
	const featuredPost = $derived(posts.find((p) => p.metadata.featured) || posts[0]);
	const recentPosts = $derived(posts.filter((p) => p.slug !== featuredPost?.slug));
</script>

<svelte:head>
	<title>911 — Pemikiran & Finansial</title>
	<meta
		name="description"
		content="Kumpulan pemikiran, catatan investasi, dan sudut pandang tentang bagaimana menata posisi keuangan dan kebebasan waktu di tengah dunia yang bising."
	/>
</svelte:head>

<div class="space-y-16 sm:space-y-24 pb-16">
	<!-- HERO SECTION (Minimalist Sky Blue, White & Radiant Hot Pink Aura) -->
	<section class="pt-8 sm:pt-14 pb-10 sm:pb-14 border-b border-white/15">
		<div class="max-w-6xl mx-auto px-4 sm:px-6">
			<div class="max-w-3xl">
				<!-- Eyebrow Badge with Hot Pink Accent Dot -->
				<div
					class="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full glass-pill text-white text-xs font-semibold tracking-wide uppercase mb-6 shadow-sm"
				>
					<span class="w-2 h-2 rounded-full bg-[#D83995] animate-ping"></span>
					<span>Pemikiran & Esai Finansial</span>
				</div>

				<!-- Main Headline: Crisp Pure White -->
				<h1
					class="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.12] mb-6 drop-shadow-[0_2px_20px_rgba(0,0,0,0.15)]"
				>
					Menavigasi Dunia yang Bising, <br />
					<span
						class="text-white drop-shadow-[0_2px_15px_rgba(216,57,149,0.5)] underline decoration-[#D83995] decoration-wavy decoration-2 underline-offset-8"
						>Membeli Otonomi Waktu</span
					>.
				</h1>

				<!-- Subheading: Soft White -->
				<p
					class="text-base sm:text-lg text-sky-50/90 leading-relaxed font-normal mb-8 max-w-2xl drop-shadow-xs"
				>
					Kumpulan catatan kritis, strategi investasi berlandaskan nilai intrinsik, dan refleksi
					tentang bagaimana seharusnya kita memposisikan diri di tengah turbulensi ekonomi global.
				</p>

				<!-- Action Buttons: Solid White Pill & Frosted Glass -->
				<div class="flex flex-wrap items-center gap-4">
					<a
						href="/artikel"
						class="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-white text-[#0593C6] font-bold text-sm hover:bg-white/95 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/15 group cursor-pointer"
					>
						<span>Jelajahi Semua Tulisan</span>
						<ArrowRight class="w-4 h-4 transition-transform group-hover:translate-x-1" />
					</a>

					<a
						href="/tentang"
						class="inline-flex items-center gap-2 px-5 py-3.5 rounded-full glass-pill hover:bg-white/25 text-white font-semibold text-sm transition-all"
					>
						<User class="w-4 h-4 text-white" />
						<span>Tentang 911 ↗</span>
					</a>
				</div>
			</div>

			<!-- Core Pillars Row (Bottom Feature Strip) -->
			<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14 pt-8 border-t border-white/20">
				<div class="p-4 rounded-2xl glass-pill hover:bg-white/20 transition-all">
					<div
						class="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white mb-2.5"
					>
						<TrendingUp class="w-4 h-4" />
					</div>
					<h3 class="font-bold text-sm text-white">Arus Kas Riil</h3>
					<p class="text-xs text-sky-50/80 mt-1 leading-relaxed">
						Fokus pada aset produktif jangka panjang di atas euforia spekulasi semu.
					</p>
				</div>

				<div class="p-4 rounded-2xl glass-pill hover:bg-white/20 transition-all">
					<div
						class="w-8 h-8 rounded-xl bg-[#D83995]/50 flex items-center justify-center text-white mb-2.5"
					>
						<ShieldCheck class="w-4 h-4" />
					</div>
					<h3 class="font-bold text-sm text-white">Seni Bertahan</h3>
					<p class="text-xs text-sky-50/80 mt-1 leading-relaxed">
						Compounding bekerja maksimal saat kita mampu bertahan melewati turbulensi badai.
					</p>
				</div>

				<div class="p-4 rounded-2xl glass-pill hover:bg-white/20 transition-all">
					<div
						class="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white mb-2.5"
					>
						<Compass class="w-4 h-4" />
					</div>
					<h3 class="font-bold text-sm text-white">Otonomi di Atas Ego</h3>
					<p class="text-xs text-sky-50/80 mt-1 leading-relaxed">
						Uang sebagai instrumen kemerdekaan memilih ritme hidup, bukan sekadar validasi.
					</p>
				</div>

				<div class="p-4 rounded-2xl glass-pill hover:bg-white/20 transition-all">
					<div
						class="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white mb-2.5"
					>
						<Flame class="w-4 h-4" />
					</div>
					<h3 class="font-bold text-sm text-white">Pikiran Mandiri</h3>
					<p class="text-xs text-sky-50/80 mt-1 leading-relaxed">
						Menganalisis dunia dengan kepala dingin tanpa terdistorsi kerumunan bising.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- FEATURED POST SECTION (Frosted Glass Panel with Hot Pink Ribbon) -->
	{#if featuredPost}
		<section class="max-w-6xl mx-auto px-4 sm:px-6">
			<div class="flex items-center justify-between mb-6">
				<div class="flex items-center gap-2">
					<Sparkles class="w-5 h-5 text-white" />
					<h2 class="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-sm">
						Tulisan Sorotan
					</h2>
				</div>
				<span
					class="text-xs font-bold text-white px-3 py-1 rounded-full bg-[#D83995] shadow-sm shadow-[#D83995]/40 uppercase tracking-wider"
				>
					Rekomendasi Utama
				</span>
			</div>

			<a
				href="/artikel/{featuredPost.slug}"
				class="block group relative p-7 sm:p-10 rounded-3xl glass-panel hover:bg-white/18 hover:border-white/40 transition-all duration-300 shadow-2xl overflow-hidden"
			>
				<!-- Hot Pink Specular Ribbon on Top-Left -->
				<div class="absolute top-0 left-0 w-2.5 h-full bg-[#D83995]"></div>

				<div class="flex flex-wrap items-center gap-3 mb-4">
					<span
						class="px-3.5 py-1 rounded-full text-xs font-bold bg-white text-[#0593C6] shadow-sm"
					>
						{featuredPost.metadata.category}
					</span>
					<div class="flex items-center gap-1.5 text-xs text-sky-100/90 font-medium">
						<Calendar class="w-3.5 h-3.5" />
						<span>{featuredPost.metadata.date}</span>
					</div>
					<div class="flex items-center gap-1.5 text-xs text-pink-200 font-medium">
						<Clock class="w-3.5 h-3.5" />
						<span>{featuredPost.metadata.readTime}</span>
					</div>
				</div>

				<h3
					class="text-2xl sm:text-3xl md:text-4xl font-black text-white group-hover:text-pink-200 transition-colors leading-tight mb-4 drop-shadow-sm"
				>
					{featuredPost.metadata.title}
				</h3>

				<p
					class="text-base sm:text-lg text-sky-50/90 leading-relaxed font-normal mb-6 max-w-3xl drop-shadow-xs"
				>
					{featuredPost.metadata.description}
				</p>

				<div
					class="inline-flex items-center gap-2 text-sm font-bold text-white group-hover:text-pink-200 transition-colors"
				>
					<span>Baca selengkapnya</span>
					<ArrowRight class="w-4 h-4 transition-transform group-hover:translate-x-1" />
				</div>
			</a>
		</section>
	{/if}

	<!-- RECENT ARTICLES SECTION (Frosted Glass Cards) -->
	<section class="max-w-6xl mx-auto px-4 sm:px-6">
		<div class="flex items-center justify-between mb-8 pb-4 border-b border-white/20">
			<div class="flex items-center gap-2">
				<BookOpen class="w-5 h-5 text-white" />
				<h2 class="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-sm">
					Koleksi Tulisan Lainnya
				</h2>
			</div>
			<a
				href="/artikel"
				class="text-xs sm:text-sm font-bold text-white hover:text-pink-200 transition flex items-center gap-1"
			>
				<span>Lihat Semua ({posts.length})</span>
				<ArrowRight class="w-3.5 h-3.5" />
			</a>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
			{#each recentPosts as post}
				<a
					href="/artikel/{post.slug}"
					class="group p-6 sm:p-8 rounded-3xl glass-panel hover:bg-white/18 hover:border-white/40 transition-all duration-300 shadow-xl flex flex-col justify-between"
				>
					<div>
						<div class="flex flex-wrap items-center justify-between gap-2 mb-3">
							<span
								class="px-3 py-1 rounded-full text-xs font-semibold glass-pill text-white group-hover:bg-[#D83995] transition-colors"
							>
								{post.metadata.category}
							</span>
							<div class="flex items-center gap-1.5 text-xs text-sky-100/80">
								<Clock class="w-3.5 h-3.5" />
								<span>{post.metadata.readTime}</span>
							</div>
						</div>

						<h3
							class="text-xl sm:text-2xl font-black text-white group-hover:text-pink-200 transition-colors leading-snug mb-3 drop-shadow-sm"
						>
							{post.metadata.title}
						</h3>

						<p class="text-sm text-sky-50/85 line-clamp-3 leading-relaxed mb-4 font-normal">
							{post.metadata.description}
						</p>
					</div>

					<div
						class="pt-4 border-t border-white/15 flex items-center justify-between text-xs text-sky-100/75"
					>
						<span>{post.metadata.date}</span>
						<span
							class="font-bold text-white group-hover:text-pink-200 transition flex items-center gap-1"
						>
							Baca tulisan →
						</span>
					</div>
				</a>
			{/each}
		</div>
	</section>

	<!-- DISCUSSION / PHILOSOPHY CALLOUT CARD -->
	<section class="max-w-6xl mx-auto px-4 sm:px-6">
		<div
			class="p-8 sm:p-12 rounded-3xl glass-panel relative overflow-hidden shadow-2xl border border-white/25 text-white"
		>
			<!-- Radiant Hot Pink & Sky Blue Aura Dispersion in Background -->
			<div
				class="absolute -right-10 -bottom-10 w-80 h-80 rounded-full bg-[#D83995]/40 blur-3xl pointer-events-none"
			></div>
			<div
				class="absolute -left-10 -top-10 w-80 h-80 rounded-full bg-[#0593C6]/40 blur-3xl pointer-events-none"
			></div>

			<div class="relative z-10 max-w-2xl">
				<div
					class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D83995] text-white text-xs font-bold mb-4 shadow-sm shadow-[#D83995]/40"
				>
					Refleksi & Diskusi
				</div>
				<h3 class="text-2xl sm:text-4xl font-black tracking-tight mb-4 drop-shadow-sm">
					Punya sudut pandang atau pemikiran berbeda?
				</h3>
				<p class="text-sm sm:text-base text-sky-50/90 leading-relaxed mb-7 font-normal">
					Dunia finansial dan dinamika hidup selalu menarik untuk dibedah secara jujur. Pelajari
					lebih lanjut mengenai prinsip dan filosofi yang saya pegang.
				</p>
				<a
					href="/tentang"
					class="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-[#0593C6] font-bold text-sm shadow-xl hover:bg-white/95 hover:scale-[1.02] active:scale-95 transition cursor-pointer"
				>
					<User class="w-4 h-4 text-[#0593C6]" />
					<span>Tentang Penulis & Filosofi</span>
				</a>
			</div>
		</div>
	</section>
</div>

