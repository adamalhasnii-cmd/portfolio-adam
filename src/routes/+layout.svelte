<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';
	import { Menu, X } from '@lucide/svelte';

	let { children }: LayoutProps = $props();
	let isMobileMenuOpen = $state(false);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>911</title>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<div class="min-h-screen flex flex-col bg-[#FCFFFF] text-[#081726] selection:bg-[#D83995] selection:text-white">
	<!-- Top Navigation -->
	<header class="sticky top-0 z-50 bg-[#FCFFFF]/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
		<div class="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
			<!-- Brand Logo -->
			<a href="/" class="flex items-center gap-3 group">
				<div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0593C6] to-[#0477a1] text-white flex items-center justify-center font-black text-lg shadow-sm shadow-[#0593C6]/20 group-hover:scale-105 transition-transform">
					<span>A</span>
					<span class="w-1.5 h-1.5 rounded-full bg-[#D83995] ml-0.5 -mt-2"></span>
				</div>
				<span class="font-black text-2xl tracking-tight text-slate-900 group-hover:text-[#0593C6] transition-colors">
					911
				</span>
			</a>

			<!-- Desktop Navigation Links -->
			<nav class="hidden md:flex items-center gap-1 sm:gap-2">
				<a
					href="/"
					class="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-[#0593C6] hover:bg-slate-100/70 transition-colors"
				>
					Beranda
				</a>
				<a
					href="/artikel"
					class="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-[#0593C6] hover:bg-slate-100/70 transition-colors"
				>
					Semua Tulisan
				</a>
				<a
					href="/tentang"
					class="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-[#0593C6] hover:bg-slate-100/70 transition-colors"
				>
					Tentang
				</a>
			</nav>

			<!-- Mobile Menu Button -->
			<button
				onclick={() => isMobileMenuOpen = !isMobileMenuOpen}
				class="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition"
				aria-label="Menu navigasi"
			>
				{#if isMobileMenuOpen}
					<X class="w-6 h-6 text-slate-900" />
				{:else}
					<Menu class="w-6 h-6 text-slate-900" />
				{/if}
			</button>
		</div>

		<!-- Mobile Menu Dropdown -->
		{#if isMobileMenuOpen}
			<div class="md:hidden border-b border-slate-200 bg-[#FCFFFF] px-4 pt-2 pb-6 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200 shadow-xl">
				<a
					href="/"
					onclick={() => isMobileMenuOpen = false}
					class="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-100"
				>
					Beranda
				</a>
				<a
					href="/artikel"
					onclick={() => isMobileMenuOpen = false}
					class="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-100"
				>
					Semua Tulisan
				</a>
				<a
					href="/tentang"
					onclick={() => isMobileMenuOpen = false}
					class="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-100"
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
	<footer class="border-t border-slate-200 bg-white/70 py-12 text-slate-600 mt-20">
		<div class="max-w-6xl mx-auto px-4 sm:px-6">
			<div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
				<!-- Brand Col -->
				<div class="md:col-span-2 space-y-3">
					<div class="flex items-center gap-2">
						<span class="font-extrabold text-xl tracking-tight text-slate-900">911</span>
						<span class="w-1.5 h-1.5 rounded-full bg-[#D83995]"></span>
					</div>
					<p class="text-sm text-slate-600 leading-relaxed max-w-md">
						Ruang eksplorasi dan esai pribadi untuk membedah dinamika dunia, psikologi mengelola kekayaan, dan strategi membangun otonomi waktu jangka panjang.
					</p>
				</div>

				<!-- Nav Links Col -->
				<div>
					<h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Navigasi</h4>
					<ul class="space-y-2.5 text-sm">
						<li><a href="/" class="hover:text-[#0593C6] transition">Beranda</a></li>
						<li><a href="/artikel" class="hover:text-[#0593C6] transition">Kumpulan Tulisan</a></li>
						<li><a href="/tentang" class="hover:text-[#0593C6] transition">Filosofi & Tentang</a></li>
					</ul>
				</div>

				<!-- Disclaimer Col -->
				<div>
					<h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Disclaimer</h4>
					<p class="text-xs text-slate-500 leading-relaxed">
						Seluruh tulisan di situs ini adalah opini dan refleksi pribadi semata. Bukan merupakan anjuran, rekomendasi, ataupun nasihat finansial resmi.
					</p>
				</div>
			</div>

			<div class="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
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
