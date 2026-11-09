<script lang="ts">
	import './layout.css';
	import type { LayoutProps } from './$types';
	import { Menu, X, Sun, Moon } from '@lucide/svelte';
	import { onMount } from 'svelte';

	let { children }: LayoutProps = $props();
	let isMobileMenuOpen = $state(false);
	let isDark = $state(false);
	let scrollProgress = $state(0);

	function updateScroll() {
		if (typeof window === 'undefined') return;
		const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
		const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
		if (height > 0) {
			scrollProgress = Math.min(100, Math.max(0, (winScroll / height) * 100));
		} else {
			scrollProgress = 0;
		}
	}

	onMount(() => {
		isDark = document.documentElement.classList.contains('dark');
		window.addEventListener('scroll', updateScroll, { passive: true });
		updateScroll();
		return () => {
			window.removeEventListener('scroll', updateScroll);
		};
	});

	function toggleTheme() {
		isDark = !isDark;
		if (isDark) {
			document.documentElement.classList.add('dark');
			localStorage.setItem('theme', 'dark');
		} else {
			document.documentElement.classList.remove('dark');
			localStorage.setItem('theme', 'light');
		}
	}
</script>

<svelte:head>
	<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
	<link rel="icon" type="image/x-icon" href="/favicon.ico" />
	<title>911</title>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<div class="min-h-screen flex flex-col bg-[#FCFFFF] dark:bg-[#07121e] text-[#081726] dark:text-[#FCFFFF] selection:bg-[#D83995] selection:text-white transition-colors duration-200">
	<!-- FLOATING LIQUID GLASS TOPBAR & SCROLL PROGRESS WRAPPER -->
	<div class="sticky top-3 sm:top-5 z-50 px-3 sm:px-6 w-full max-w-5xl mx-auto">
		<!-- Liquid Glass Capsule Topbar -->
		<header class="relative rounded-full bg-white/65 dark:bg-[#081726]/75 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.1)] px-4 sm:px-6 h-15 sm:h-16 flex items-center justify-between transition-all duration-300">
			<!-- Brand Logo -->
			<a href="/" class="flex items-center gap-2.5 group">
				<div class="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#0593C6] to-[#0477a1] text-white flex items-center justify-center font-black text-base sm:text-lg shadow-sm shadow-[#0593C6]/25 group-hover:scale-105 transition-transform">
					<span>A</span>
					<span class="w-1.5 h-1.5 rounded-full bg-[#D83995] ml-0.5 -mt-2"></span>
				</div>
				<span class="font-black text-xl sm:text-2xl tracking-tight text-slate-900 dark:text-white group-hover:text-[#0593C6] transition-colors">
					911
				</span>
			</a>

			<!-- Desktop Navigation Links -->
			<nav class="hidden md:flex items-center gap-1 sm:gap-2">
				<a
					href="/"
					class="px-4 py-1.5 rounded-full text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-[#0593C6] dark:hover:text-[#0593C6] hover:bg-black/5 dark:hover:bg-white/5 transition-all"
				>
					Beranda
				</a>
				<a
					href="/artikel"
					class="px-4 py-1.5 rounded-full text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-[#0593C6] dark:hover:text-[#0593C6] hover:bg-black/5 dark:hover:bg-white/5 transition-all"
				>
					Semua Tulisan
				</a>
				<a
					href="/tentang"
					class="px-4 py-1.5 rounded-full text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-[#0593C6] dark:hover:text-[#0593C6] hover:bg-black/5 dark:hover:bg-white/5 transition-all"
				>
					Tentang
				</a>
			</nav>

			<!-- Right Actions: Theme Toggle & Capsule Button -->
			<div class="flex items-center gap-2">
				<!-- Dark / Light Mode Toggle Button -->
				<button
					type="button"
					onclick={toggleTheme}
					class="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 hover:text-[#0593C6] dark:hover:text-[#0593C6] transition-colors cursor-pointer"
					aria-label="Ganti mode terang/gelap"
					title={isDark ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
				>
					{#if isDark}
						<Sun class="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
					{:else}
						<Moon class="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
					{/if}
				</button>

				<!-- Explore CTA Button (Like in Benjamin Cowen topbar) -->
				<a
					href="/artikel"
					class="hidden sm:inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-[#0593C6] to-[#0477a1] text-white text-xs font-bold hover:opacity-90 shadow-sm shadow-[#0593C6]/30 transition-transform active:scale-95"
				>
					Jelajahi
				</a>

				<!-- Mobile Menu Button -->
				<button
					onclick={() => isMobileMenuOpen = !isMobileMenuOpen}
					class="md:hidden p-2 rounded-full text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 transition"
					aria-label="Menu navigasi"
				>
					{#if isMobileMenuOpen}
						<X class="w-5 h-5 text-slate-900 dark:text-white" />
					{:else}
						<Menu class="w-5 h-5 text-slate-900 dark:text-white" />
					{/if}
				</button>
			</div>
		</header>

		<!-- Scroll Progress Bar Directly Under Topbar -->
		<div class="px-5 mt-1.5 w-full pointer-events-none">
			<div class="w-full h-[3px] bg-slate-200/40 dark:bg-slate-800/50 rounded-full overflow-hidden backdrop-blur-sm">
				<div
					class="h-full bg-gradient-to-r from-[#0593C6] via-[#D83995] to-[#f29185] rounded-full transition-all duration-100 ease-out shadow-[0_0_8px_rgba(216,57,149,0.6)]"
					style="width: {scrollProgress}%;"
				></div>
			</div>
		</div>

		<!-- Mobile Floating Glass Dropdown Menu -->
		{#if isMobileMenuOpen}
			<div class="md:hidden mt-2 p-4 rounded-3xl bg-white/80 dark:bg-[#081726]/85 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-2xl space-y-1.5 animate-in fade-in slide-in-from-top-3 duration-200">
				<a
					href="/"
					onclick={() => isMobileMenuOpen = false}
					class="block px-4 py-2.5 rounded-2xl text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/70"
				>
					Beranda
				</a>
				<a
					href="/artikel"
					onclick={() => isMobileMenuOpen = false}
					class="block px-4 py-2.5 rounded-2xl text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/70"
				>
					Semua Tulisan
				</a>
				<a
					href="/tentang"
					onclick={() => isMobileMenuOpen = false}
					class="block px-4 py-2.5 rounded-2xl text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/70"
				>
					Tentang Saya
				</a>
			</div>
		{/if}
	</div>

	<!-- Main Content Slot -->
	<main class="flex-1 pt-4 sm:pt-6">
		{@render children()}
	</main>

	<!-- Footer -->
	<footer class="border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-[#07121e]/80 py-12 text-slate-600 dark:text-slate-400 mt-20 transition-colors">
		<div class="max-w-6xl mx-auto px-4 sm:px-6">
			<div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
				<!-- Brand Col -->
				<div class="md:col-span-2 space-y-3">
					<div class="flex items-center gap-2">
						<span class="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">911</span>
						<span class="w-1.5 h-1.5 rounded-full bg-[#D83995]"></span>
					</div>
					<p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-md">
						Ruang eksplorasi dan esai pribadi untuk membedah dinamika dunia, psikologi mengelola kekayaan, dan strategi membangun otonomi waktu jangka panjang.
					</p>
				</div>

				<!-- Nav Links Col -->
				<div>
					<h4 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Navigasi</h4>
					<ul class="space-y-2.5 text-sm">
						<li><a href="/" class="hover:text-[#0593C6] transition">Beranda</a></li>
						<li><a href="/artikel" class="hover:text-[#0593C6] transition">Kumpulan Tulisan</a></li>
						<li><a href="/tentang" class="hover:text-[#0593C6] transition">Filosofi & Tentang</a></li>
					</ul>
				</div>

				<!-- Disclaimer Col -->
				<div>
					<h4 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Disclaimer</h4>
					<p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
						Seluruh tulisan di situs ini adalah opini dan refleksi pribadi semata. Bukan merupakan anjuran, rekomendasi, ataupun nasihat finansial resmi.
					</p>
				</div>
			</div>

			<div class="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
				<div>
					© {new Date().getFullYear()} 911. Hak cipta dilindungi.
				</div>
				<div>
					<button onclick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} class="hover:text-[#0593C6] transition cursor-pointer">
						Ke Atas ↑
					</button>
				</div>
			</div>
		</div>
	</footer>
</div>
