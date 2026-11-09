<script lang="ts">
	import './layout.css';
	import type { LayoutProps } from './$types';
	import { Menu, X, Sun, Moon } from '@lucide/svelte';
	import { onMount } from 'svelte';

	let { children }: LayoutProps = $props();
	let isMobileMenuOpen = $state(false);
	let isDark = $state(false);

	onMount(() => {
		isDark = document.documentElement.classList.contains('dark');
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
	<!-- Top Navigation -->
	<header class="sticky top-0 z-50 bg-[#FCFFFF]/90 dark:bg-[#07121e]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
		<div class="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
			<!-- Brand Logo -->
			<a href="/" class="flex items-center gap-3 group">
				<div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0593C6] to-[#0477a1] text-white flex items-center justify-center font-black text-lg shadow-sm shadow-[#0593C6]/20 group-hover:scale-105 transition-transform">
					<span>A</span>
					<span class="w-1.5 h-1.5 rounded-full bg-[#D83995] ml-0.5 -mt-2"></span>
				</div>
				<span class="font-black text-2xl tracking-tight text-slate-900 dark:text-white group-hover:text-[#0593C6] transition-colors">
					911
				</span>
			</a>

			<!-- Desktop Navigation Links + Dark Mode Toggle -->
			<div class="hidden md:flex items-center gap-1 sm:gap-2">
				<nav class="flex items-center gap-1">
					<a
						href="/"
						class="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-[#0593C6] dark:hover:text-[#0593C6] hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-colors"
					>
						Beranda
					</a>
					<a
						href="/artikel"
						class="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-[#0593C6] dark:hover:text-[#0593C6] hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-colors"
					>
						Semua Tulisan
					</a>
					<a
						href="/tentang"
						class="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-[#0593C6] dark:hover:text-[#0593C6] hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-colors"
					>
						Tentang
					</a>
				</nav>

				<div class="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-2"></div>

				<!-- Dark / Light Mode Toggle Button -->
				<button
					type="button"
					onclick={toggleTheme}
					class="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#0593C6] dark:hover:text-[#0593C6] transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
					aria-label="Ganti mode terang/gelap"
					title={isDark ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
				>
					{#if isDark}
						<Sun class="w-5 h-5 text-amber-400" />
					{:else}
						<Moon class="w-5 h-5 text-slate-700" />
					{/if}
				</button>
			</div>

			<!-- Mobile Right Icons (Theme Toggle + Menu) -->
			<div class="md:hidden flex items-center gap-2">
				<button
					type="button"
					onclick={toggleTheme}
					class="p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
					aria-label="Ganti tema"
				>
					{#if isDark}
						<Sun class="w-5 h-5 text-amber-400" />
					{:else}
						<Moon class="w-5 h-5 text-slate-700" />
					{/if}
				</button>

				<button
					onclick={() => isMobileMenuOpen = !isMobileMenuOpen}
					class="p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
					aria-label="Menu navigasi"
				>
					{#if isMobileMenuOpen}
						<X class="w-6 h-6 text-slate-900 dark:text-white" />
					{:else}
						<Menu class="w-6 h-6 text-slate-900 dark:text-white" />
					{/if}
				</button>
			</div>
		</div>

		<!-- Mobile Menu Dropdown -->
		{#if isMobileMenuOpen}
			<div class="md:hidden border-b border-slate-200 dark:border-slate-800 bg-[#FCFFFF] dark:bg-[#07121e] px-4 pt-2 pb-6 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200 shadow-xl">
				<a
					href="/"
					onclick={() => isMobileMenuOpen = false}
					class="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
				>
					Beranda
				</a>
				<a
					href="/artikel"
					onclick={() => isMobileMenuOpen = false}
					class="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
				>
					Semua Tulisan
				</a>
				<a
					href="/tentang"
					onclick={() => isMobileMenuOpen = false}
					class="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
				>
					Tentang Saya
				</a>
			</div>
		{/if}
	</header>

	<!-- Main Content Slot -->
	<main class="flex-1">
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
					<button onclick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} class="hover:text-[#0593C6] transition">
						Ke Atas ↑
					</button>
				</div>
			</div>
		</div>
	</footer>
</div>
