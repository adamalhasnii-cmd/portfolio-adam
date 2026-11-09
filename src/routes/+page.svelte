<script lang="ts">
	import type { PageProps } from './$types';
	import { ArrowRight, BookOpen, Clock, Calendar, Sparkles, TrendingUp, ShieldCheck, Compass, PenTool } from '@lucide/svelte';

	let { data }: PageProps = $props();

	const posts = $derived(data.posts || []);
	const featuredPost = $derived(posts.find((p) => p.metadata.featured) || posts[0]);
	const recentPosts = $derived(posts.filter((p) => p.slug !== featuredPost?.slug));
</script>

<svelte:head>
	<title>Adam Alhasni — Pemikiran & Finansial</title>
	<meta name="description" content="Kumpulan pemikiran, catatan investasi, dan sudut pandang tentang bagaimana menata posisi keuangan dan kebebasan waktu di tengah dunia yang bising." />
</svelte:head>

<div class="space-y-16 sm:space-y-24 pb-12">
	<!-- Hero Section -->
	<section class="pt-12 sm:pt-20 pb-8 sm:pb-12 border-b border-slate-200/80">
		<div class="max-w-6xl mx-auto px-4 sm:px-6">
			<div class="max-w-3xl">
				<!-- Eyebrow Badge -->
				<div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0593C6]/10 border border-[#0593C6]/20 text-[#0593C6] text-xs font-semibold tracking-wide uppercase mb-6">
					<span class="w-2 h-2 rounded-full bg-[#D83995] animate-pulse"></span>
					Pemikiran & Esai Finansial
				</div>

				<!-- Main Headline -->
				<h1 class="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-[1.15] mb-6">
					Menavigasi Dunia yang Bising, <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#0593C6] via-[#0593C6] to-[#D83995]">Membeli Otonomi Waktu</span>.
				</h1>

				<!-- Subheading -->
				<p class="text-lg sm:text-xl text-slate-600 leading-relaxed font-normal mb-8 max-w-2xl">
					Kumpulan catatan kritis, strategi investasi berlandaskan nilai intrinsik, dan refleksi tentang bagaimana seharusnya kita memposisikan diri di tengah turbulensi ekonomi global.
				</p>

				<!-- Action Buttons -->
				<div class="flex flex-wrap items-center gap-4">
					<a
						href="/artikel"
						class="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#0593C6] text-white font-semibold text-sm hover:bg-[#0477a1] transition-all shadow-md shadow-[#0593C6]/20 group"
					>
						<span>Jelajahi Semua Tulisan</span>
						<ArrowRight class="w-4 h-4 transition-transform group-hover:translate-x-1" />
					</a>

					<a
						href="/admin"
						class="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white text-slate-700 font-semibold text-sm border border-slate-200 hover:border-[#D83995] hover:text-[#D83995] transition-all shadow-sm"
					>
						<PenTool class="w-4 h-4 text-[#D83995]" />
						<span>Tulis Artikel Baru</span>
					</a>
				</div>
			</div>

			<!-- Three Core Pillars Bar -->
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-14 pt-10 border-t border-slate-200/60">
				<div class="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-xs">
					<div class="w-10 h-10 rounded-lg bg-[#0593C6]/10 text-[#0593C6] flex items-center justify-center shrink-0">
						<TrendingUp class="w-5 h-5" />
					</div>
					<div>
						<h3 class="font-bold text-sm text-slate-900">Arus Kas & Nilai Riil</h3>
						<p class="text-xs text-slate-500 mt-1 leading-relaxed">
							Mengabaikan euforia instan dan fokus pada aset yang menghasilkan arus kas produktif jangka panjang.
						</p>
					</div>
				</div>

				<div class="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-xs">
					<div class="w-10 h-10 rounded-lg bg-[#D83995]/10 text-[#D83995] flex items-center justify-center shrink-0">
						<ShieldCheck class="w-5 h-5" />
					</div>
					<div>
						<h3 class="font-bold text-sm text-slate-900">Seni Bertahan Hidup</h3>
						<p class="text-xs text-slate-500 mt-1 leading-relaxed">
							Menjaga modal tetap utuh di saat badai, karena compounding butuh kelangsungan hidup tanpa interupsi.
						</p>
					</div>
				</div>

				<div class="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-xs">
					<div class="w-10 h-10 rounded-lg bg-[#f29185]/20 text-[#d96c5e] flex items-center justify-center shrink-0">
						<Compass class="w-5 h-5" />
					</div>
					<div>
						<h3 class="font-bold text-sm text-slate-900">Otonomi di Atas Ego</h3>
						<p class="text-xs text-slate-500 mt-1 leading-relaxed">
							Uang bukan untuk pamer kemewahan semu, melainkan alat untuk bebas menentukan ritme hidup sendiri.
						</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Featured Post Section -->
	{#if featuredPost}
		<section class="max-w-6xl mx-auto px-4 sm:px-6">
			<div class="flex items-center justify-between mb-6">
				<div class="flex items-center gap-2">
					<Sparkles class="w-5 h-5 text-[#D83995]" />
					<h2 class="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Tulisan Sorotan</h2>
				</div>
				<span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Paling Direkomendasikan</span>
			</div>

			<a
				href="/artikel/{featuredPost.slug}"
				class="block group relative p-6 sm:p-10 rounded-2xl bg-gradient-to-br from-white to-sky-50/40 border border-slate-200/90 hover:border-[#0593C6]/60 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-[#0593C6]/5 overflow-hidden"
			>
				<div class="absolute top-0 left-0 w-2 h-full bg-[#D83995]"></div>
				
				<div class="flex flex-wrap items-center gap-3 mb-4">
					<span class="px-3 py-1 rounded-full text-xs font-semibold bg-[#0593C6]/10 text-[#0593C6] border border-[#0593C6]/20">
						{featuredPost.metadata.category}
					</span>
					<div class="flex items-center gap-1.5 text-xs text-slate-500">
						<Calendar class="w-3.5 h-3.5 text-slate-400" />
						<span>{featuredPost.metadata.date}</span>
					</div>
					<div class="flex items-center gap-1.5 text-xs text-slate-500">
						<Clock class="w-3.5 h-3.5 text-[#D83995]" />
						<span>{featuredPost.metadata.readTime}</span>
					</div>
				</div>

				<h3 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 group-hover:text-[#0593C6] transition-colors leading-tight mb-4">
					{featuredPost.metadata.title}
				</h3>

				<p class="text-base sm:text-lg text-slate-600 leading-relaxed font-normal mb-6 max-w-3xl">
					{featuredPost.metadata.description}
				</p>

				<div class="flex items-center gap-2 text-sm font-semibold text-[#0593C6] group-hover:text-[#D83995] transition-colors">
					<span>Baca selengkapnya</span>
					<ArrowRight class="w-4 h-4 transition-transform group-hover:translate-x-1" />
				</div>
			</a>
		</section>
	{/if}

	<!-- Recent Articles Section -->
	<section class="max-w-6xl mx-auto px-4 sm:px-6">
		<div class="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
			<div class="flex items-center gap-2">
				<BookOpen class="w-5 h-5 text-[#0593C6]" />
				<h2 class="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Koleksi Tulisan Lainnya</h2>
			</div>
			<a href="/artikel" class="text-xs sm:text-sm font-semibold text-[#0593C6] hover:text-[#D83995] transition flex items-center gap-1">
				<span>Lihat Semua ({posts.length})</span>
				<ArrowRight class="w-3.5 h-3.5" />
			</a>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
			{#each recentPosts as post}
				<a
					href="/artikel/{post.slug}"
					class="group p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 hover:border-[#0593C6]/50 transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between"
				>
					<div>
						<div class="flex flex-wrap items-center justify-between gap-2 mb-3">
							<span class="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 group-hover:bg-[#0593C6]/10 group-hover:text-[#0593C6] transition-colors">
								{post.metadata.category}
							</span>
							<div class="flex items-center gap-1.5 text-xs text-slate-400">
								<Clock class="w-3.5 h-3.5" />
								<span>{post.metadata.readTime}</span>
							</div>
						</div>

						<h3 class="text-xl font-bold text-slate-900 group-hover:text-[#0593C6] transition-colors leading-snug mb-3">
							{post.metadata.title}
						</h3>

						<p class="text-sm text-slate-600 line-clamp-3 leading-relaxed mb-4">
							{post.metadata.description}
						</p>
					</div>

					<div class="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
						<span>{post.metadata.date}</span>
						<span class="font-semibold text-[#0593C6] group-hover:text-[#D83995] transition flex items-center gap-1">
							Baca tulisan →
						</span>
					</div>
				</a>
			{/each}
		</div>
	</section>

	<!-- Callout for Discussion / Reflection -->
	<section class="max-w-6xl mx-auto px-4 sm:px-6">
		<div class="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-[#081726] text-white relative overflow-hidden shadow-xl">
			<div class="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-[#0593C6]/20 blur-3xl"></div>
			<div class="absolute -left-10 -top-10 w-72 h-72 rounded-full bg-[#D83995]/20 blur-3xl"></div>

			<div class="relative z-10 max-w-2xl">
				<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#f29185] text-xs font-semibold mb-4">
					Tulis & Bagikan Pemikiran
				</div>
				<h3 class="text-2xl sm:text-3xl font-extrabold tracking-tight mb-4">
					Punya ide atau pemikiran baru hari ini?
				</h3>
				<p class="text-sm sm:text-base text-slate-300 leading-relaxed mb-6 font-normal">
					Anda bisa langsung membuka mode editor admin untuk mengetik ide investasi atau refleksi dunia kapan saja secara langsung dari browser laptop atau ponsel.
				</p>
				<a
					href="/admin"
					class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#D83995] to-[#f29185] text-white font-bold text-sm shadow-md hover:opacity-95 transition"
				>
					<PenTool class="w-4 h-4" />
					<span>Buka Editor Tulisan</span>
				</a>
			</div>
		</div>
	</section>
</div>
