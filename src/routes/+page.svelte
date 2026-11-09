<script lang="ts">
	import type { PageProps } from './$types';
	import {
		ArrowRight,
		BookOpen,
		Clock,
		Calendar,
		Sparkles,
		User
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
	<section class="pt-8 sm:pt-14 pb-10 sm:pb-14 border-b border-sky-200/50 dark:border-white/15">
		<div class="max-w-6xl mx-auto px-4 sm:px-6">
			<div class="max-w-3xl">
				<!-- Main Headline: Crisp & Legible in Light & Dark Mode -->
				<h1
					class="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#061a2e] dark:text-white leading-[1.12] mb-6 drop-shadow-xs"
				>
					Menavigasi Dunia yang Bising, <br />
					<span
						class="text-[#061a2e] dark:text-white underline decoration-[#D83995] decoration-wavy decoration-2 underline-offset-8"
						>Membeli Otonomi Waktu</span
					>.
				</h1>

				<!-- Subheading: High-Contrast Slate / Ice-White -->
				<p
					class="text-base sm:text-lg text-[#2e4a68] dark:text-sky-50/90 leading-relaxed font-normal mb-8 max-w-2xl"
				>
					Kumpulan catatan kritis, strategi investasi berlandaskan nilai intrinsik, dan refleksi
					tentang bagaimana seharusnya kita memposisikan diri di tengah turbulensi ekonomi global.
				</p>

				<!-- Action Buttons: Solid Vibrant Pill & Frosted Glass -->
				<div class="flex flex-wrap items-center gap-4">
					<a
						href="/artikel"
						class="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#0593C6] text-white hover:bg-[#047ea8] hover:text-white dark:bg-white dark:text-[#0593C6] dark:hover:bg-sky-50 dark:hover:text-[#0593C6] font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#0593C6]/25 dark:shadow-black/15 group cursor-pointer"
					>
						<span>Jelajahi Semua Tulisan</span>
						<ArrowRight class="w-4 h-4 transition-transform group-hover:translate-x-1" />
					</a>

					<a
						href="/tentang"
						class="inline-flex items-center gap-2 px-5 py-3.5 rounded-full glass-pill hover:bg-sky-500/10 dark:hover:bg-white/25 text-[#061a2e] dark:text-white font-semibold text-sm transition-all"
					>
						<User class="w-4 h-4 text-[#0593C6] dark:text-white" />
						<span>Tentang 911 ↗</span>
					</a>
				</div>
			</div>
		</div>
	</section>

	<!-- FEATURED POST SECTION (Frosted Glass Panel with Hot Pink Ribbon) -->
	{#if featuredPost}
		<section class="max-w-6xl mx-auto px-4 sm:px-6">
			<div class="flex items-center justify-between mb-6">
				<div class="flex items-center gap-2">
					<Sparkles class="w-5 h-5 text-[#0593C6] dark:text-white" />
					<h2 class="text-xl sm:text-2xl font-black text-[#061a2e] dark:text-white tracking-tight">
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
				class="block group relative p-7 sm:p-10 rounded-3xl glass-panel hover:border-[#0593C6]/40 dark:hover:border-white/40 transition-all duration-300 shadow-xl overflow-hidden text-[#061a2e] dark:text-white"
			>
				<!-- Hot Pink Specular Ribbon on Top-Left -->
				<div class="absolute top-0 left-0 w-2.5 h-full bg-[#D83995]"></div>

				<div class="flex flex-wrap items-center gap-3 mb-4">
					<span
						class="px-3.5 py-1 rounded-full text-xs font-bold bg-[#0593C6] text-white dark:bg-white dark:text-[#0593C6] shadow-sm"
					>
						{featuredPost.metadata.category}
					</span>
					<div class="flex items-center gap-1.5 text-xs text-[#516f8e] dark:text-sky-100/90 font-medium">
						<Calendar class="w-3.5 h-3.5" />
						<span>{featuredPost.metadata.date}</span>
					</div>
					<div class="flex items-center gap-1.5 text-xs text-[#D83995] dark:text-pink-200 font-semibold">
						<Clock class="w-3.5 h-3.5" />
						<span>{featuredPost.metadata.readTime}</span>
					</div>
				</div>

				<h3
					class="text-2xl sm:text-3xl md:text-4xl font-black text-[#061a2e] dark:text-white group-hover:text-[#0593C6] dark:group-hover:text-pink-200 transition-colors leading-tight mb-4"
				>
					{featuredPost.metadata.title}
				</h3>

				<p
					class="text-base sm:text-lg text-[#324f6e] dark:text-sky-50/90 leading-relaxed font-normal mb-6 max-w-3xl"
				>
					{featuredPost.metadata.description}
				</p>

				<div
					class="inline-flex items-center gap-2 text-sm font-bold text-[#0593C6] dark:text-white group-hover:text-[#D83995] dark:group-hover:text-pink-200 transition-colors"
				>
					<span>Baca selengkapnya</span>
					<ArrowRight class="w-4 h-4 transition-transform group-hover:translate-x-1" />
				</div>
			</a>
		</section>
	{/if}

	<!-- RECENT ARTICLES SECTION (Frosted Glass Cards) -->
	<section class="max-w-6xl mx-auto px-4 sm:px-6">
		<div class="flex items-center justify-between mb-8 pb-4 border-b border-sky-200/50 dark:border-white/20">
			<div class="flex items-center gap-2">
				<BookOpen class="w-5 h-5 text-[#0593C6] dark:text-white" />
				<h2 class="text-xl sm:text-2xl font-black text-[#061a2e] dark:text-white tracking-tight">
					Koleksi Tulisan Lainnya
				</h2>
			</div>
			<a
				href="/artikel"
				class="text-xs sm:text-sm font-bold text-[#0593C6] dark:text-white hover:text-[#D83995] dark:hover:text-pink-200 transition flex items-center gap-1"
			>
				<span>Lihat Semua ({posts.length})</span>
				<ArrowRight class="w-3.5 h-3.5" />
			</a>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
			{#each recentPosts as post}
				<a
					href="/artikel/{post.slug}"
					class="group p-6 sm:p-8 rounded-3xl glass-panel hover:border-[#0593C6]/40 dark:hover:border-white/40 transition-all duration-300 shadow-lg flex flex-col justify-between text-[#061a2e] dark:text-white"
				>
					<div>
						<div class="flex flex-wrap items-center justify-between gap-2 mb-3">
							<span
								class="px-3 py-1 rounded-full text-xs font-bold bg-[#0593C6]/10 text-[#0593C6] border border-[#0593C6]/25 dark:bg-white/10 dark:text-sky-200 dark:border-white/20 transition-colors"
							>
								{post.metadata.category}
							</span>
							<div class="flex items-center gap-1.5 text-xs text-[#516f8e] dark:text-sky-100/80">
								<Clock class="w-3.5 h-3.5 text-[#D83995]" />
								<span>{post.metadata.readTime}</span>
							</div>
						</div>

						<h3
							class="text-xl sm:text-2xl font-black text-[#061a2e] dark:text-white group-hover:text-[#0593C6] dark:group-hover:text-pink-200 transition-colors leading-snug mb-3"
						>
							{post.metadata.title}
						</h3>

						<p class="text-sm text-[#33506f] dark:text-sky-50/85 line-clamp-3 leading-relaxed mb-4 font-normal">
							{post.metadata.description}
						</p>
					</div>

					<div
						class="pt-4 border-t border-sky-100 dark:border-white/15 flex items-center justify-between text-xs text-[#516f8e] dark:text-sky-100/75"
					>
						<span>{post.metadata.date}</span>
						<span
							class="font-bold text-[#0593C6] dark:text-white group-hover:text-[#D83995] dark:group-hover:text-pink-200 transition flex items-center gap-1"
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
			class="p-8 sm:p-12 rounded-3xl glass-panel relative overflow-hidden shadow-2xl border border-sky-200/60 dark:border-white/25 text-[#061a2e] dark:text-white"
		>
			<!-- Radiant Hot Pink & Sky Blue Smooth Radial Aura (Zero GPU WebKit glitching) -->
			<div
				class="absolute -right-16 -bottom-16 w-96 h-96 rounded-full pointer-events-none"
				style="background: radial-gradient(circle, rgba(216,57,149,0.25) 0%, transparent 70%);"
			></div>
			<div
				class="absolute -left-16 -top-16 w-96 h-96 rounded-full pointer-events-none"
				style="background: radial-gradient(circle, rgba(5,147,198,0.25) 0%, transparent 70%);"
			></div>

			<div class="relative z-10 max-w-2xl">
				<div
					class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D83995] text-white text-xs font-bold mb-4 shadow-sm shadow-[#D83995]/40"
				>
					Refleksi & Diskusi
				</div>
				<h3 class="text-2xl sm:text-4xl font-black tracking-tight mb-4 text-[#061a2e] dark:text-white">
					Punya sudut pandang atau pemikiran berbeda?
				</h3>
				<p class="text-sm sm:text-base text-[#324f6e] dark:text-sky-50/90 leading-relaxed mb-7 font-normal">
					Dunia finansial dan dinamika hidup selalu menarik untuk dibedah secara jujur. Pelajari
					lebih lanjut mengenai prinsip dan filosofi yang saya pegang.
				</p>
				<a
					href="/tentang"
					class="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#0593C6] text-white hover:bg-[#047ea8] hover:text-white dark:bg-white dark:text-[#0593C6] dark:hover:bg-sky-50 dark:hover:text-[#0593C6] font-bold text-sm shadow-xl shadow-[#0593C6]/25 dark:shadow-black/15 hover:scale-[1.02] active:scale-95 transition cursor-pointer"
				>
					<User class="w-4 h-4" />
					<span>Tentang Penulis & Filosofi</span>
				</a>
			</div>
		</div>
	</section>
</div>

