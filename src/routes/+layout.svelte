<script lang="ts">
	import './layout.css';
	import type { LayoutProps } from './$types';
	import {
		Menu,
		X,
		Sun,
		Moon,
		Search,
		FileText,
		ArrowRight,
		ArrowUp,
		BookOpen,
		CornerDownLeft,
		ChevronDown,
		LogOut
	} from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { goto } from '$app/navigation';

	let { data, children }: LayoutProps = $props();
	let isMobileMenuOpen = $state(false);
	let isAdminMenuOpen = $state(false);
	let isDark = $state(false);
	let scrollProgress = $state(0);
	let showScrollTop = $state(false);

	// Search Modal State
	let isSearchOpen = $state(false);
	let searchQuery = $state('');
	let searchInputEl = $state<HTMLInputElement | null>(null);
	let activeResultIndex = $state(0);

	function updateScroll() {
		if (typeof window === 'undefined') return;
		const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
		showScrollTop = winScroll > 250;
		const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
		if (height > 0) {
			scrollProgress = Math.min(100, Math.max(0, (winScroll / height) * 100));
		} else {
			scrollProgress = 0;
		}
	}

	function openSearch() {
		isSearchOpen = true;
		searchQuery = '';
		activeResultIndex = 0;
		setTimeout(() => searchInputEl?.focus(), 60);
	}

	function closeSearch() {
		isSearchOpen = false;
		searchQuery = '';
	}

	function navigateTo(url: string) {
		closeSearch();
		isMobileMenuOpen = false;
		goto(url);
	}

	// Dynamic search filtering across all posts
	let searchResults = $derived.by(() => {
		const q = searchQuery.trim().toLowerCase();
		if (!q) return [];
		const posts = (data as any)?.posts || [];
		return posts.filter((p: any) => {
			const title = (p.metadata?.title || '').toLowerCase();
			const desc = (p.metadata?.description || '').toLowerCase();
			const category = (p.metadata?.category || '').toLowerCase();
			const tags = (p.metadata?.tags || []).join(' ').toLowerCase();
			return title.includes(q) || desc.includes(q) || category.includes(q) || tags.includes(q);
		});
	});

	function handleKeydown(e: KeyboardEvent) {
		// Toggle search with Cmd+K or Ctrl+K
		if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
			e.preventDefault();
			if (isSearchOpen) {
				closeSearch();
			} else {
				openSearch();
			}
			return;
		}

		// Escape closes search modal and admin menu
		if (e.key === 'Escape') {
			if (isAdminMenuOpen) isAdminMenuOpen = false;
			if (isSearchOpen) {
				e.preventDefault();
				closeSearch();
				return;
			}
		}

		// Arrow keys and Enter navigation when search is open
		if (isSearchOpen) {
			const targetList = searchQuery.trim() ? searchResults : ((data as any)?.posts || []);
			if (targetList.length > 0) {
				if (e.key === 'ArrowDown') {
					e.preventDefault();
					activeResultIndex = (activeResultIndex + 1) % targetList.length;
				} else if (e.key === 'ArrowUp') {
					e.preventDefault();
					activeResultIndex = (activeResultIndex - 1 + targetList.length) % targetList.length;
				} else if (e.key === 'Enter') {
					e.preventDefault();
					const selected = targetList[activeResultIndex];
					if (selected) {
						navigateTo(`/artikel/${selected.slug}`);
					}
				}
			}
		}
	}

	onMount(() => {
		isDark = document.documentElement.classList.contains('dark');
		window.addEventListener('scroll', updateScroll, { passive: true });
		window.addEventListener('keydown', handleKeydown);

		const handleClickOutside = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			if (!target.closest('#admin-menu-container')) {
				isAdminMenuOpen = false;
			}
		};
		window.addEventListener('click', handleClickOutside);

		updateScroll();
		return () => {
			window.removeEventListener('scroll', updateScroll);
			window.removeEventListener('keydown', handleKeydown);
			window.removeEventListener('click', handleClickOutside);
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

<div class="min-h-screen flex flex-col pelma-bg text-[#061a2e] dark:text-white selection:bg-[#D83995] selection:text-white transition-colors duration-200">
	<!-- FLOATING LIQUID GLASS TOPBAR & SCROLL PROGRESS WRAPPER -->
	<div class="sticky top-3 sm:top-5 z-50 px-3 sm:px-6 w-full max-w-5xl mx-auto">
		<!-- Liquid Glass Capsule Topbar -->
		<header class="relative rounded-full glass-panel px-4 sm:px-6 h-15 sm:h-16 flex items-center justify-between text-[#061a2e] dark:text-white transition-all duration-300">
			<!-- Brand Logo -->
			<a href="/" class="flex items-center gap-2.5 group">
				<div class="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#0593C6] dark:bg-white/20 border border-[#0593C6]/30 dark:border-white/30 text-white flex items-center justify-center font-black text-base sm:text-lg shadow-sm group-hover:scale-105 transition-transform backdrop-blur-md">
					<span>A</span>
					<span class="w-1.5 h-1.5 rounded-full bg-[#D83995] ml-0.5 -mt-2"></span>
				</div>
				<span class="font-black text-xl sm:text-2xl tracking-tight text-[#061a2e] dark:text-white group-hover:text-[#0593C6] dark:group-hover:text-pink-200 transition-colors">
					911
				</span>
			</a>

			<!-- Desktop Navigation Links -->
			<nav class="hidden md:flex items-center gap-1 sm:gap-1.5">
				<a
					href="/"
					class="px-4 py-1.5 rounded-full text-sm font-semibold text-[#2d4766] dark:text-white/85 hover:text-[#0593C6] dark:hover:text-white hover:bg-sky-500/10 dark:hover:bg-white/15 transition-all"
				>
					Beranda
				</a>
				<a
					href="/artikel"
					class="px-4 py-1.5 rounded-full text-sm font-semibold text-[#2d4766] dark:text-white/85 hover:text-[#0593C6] dark:hover:text-white hover:bg-sky-500/10 dark:hover:bg-white/15 transition-all"
				>
					Semua Tulisan
				</a>
				<a
					href="/tentang"
					class="px-4 py-1.5 rounded-full text-sm font-semibold text-[#2d4766] dark:text-white/85 hover:text-[#0593C6] dark:hover:text-white hover:bg-sky-500/10 dark:hover:bg-white/15 transition-all"
				>
					Tentang
				</a>
			</nav>

			<!-- Right Actions: Admin Button, Theme Toggle & Search Button -->
			<div class="flex items-center gap-1.5 sm:gap-2">
				{#if (data as any)?.isAdmin}
					<div class="relative" id="admin-menu-container">
						<button
							type="button"
							onclick={() => isAdminMenuOpen = !isAdminMenuOpen}
							class="px-3.5 py-1.5 rounded-full bg-[#0593C6] hover:bg-[#047ea8] text-white dark:bg-white dark:text-[#0593C6] dark:hover:bg-white/90 font-bold text-xs shadow-md shadow-[#0593C6]/20 dark:shadow-black/20 transition cursor-pointer flex items-center gap-1.5"
							title="Menu Admin"
							aria-expanded={isAdminMenuOpen}
						>
							<span>Admin</span>
							<ChevronDown class="w-3 h-3 transition-transform duration-200 {isAdminMenuOpen ? 'rotate-180' : ''}" />
						</button>

						{#if isAdminMenuOpen}
							<div
								class="absolute right-0 mt-2 w-44 rounded-2xl glass-panel p-1.5 border border-sky-200/80 dark:border-white/20 shadow-xl shadow-sky-950/10 dark:shadow-black/40 z-50 animate-in fade-in zoom-in-95 duration-150"
							>
								<a
									href="/admin"
									onclick={() => isAdminMenuOpen = false}
									class="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#061a2e] dark:text-white hover:bg-[#0593C6]/10 dark:hover:bg-white/10 hover:text-[#0593C6] dark:hover:text-sky-300 transition"
								>
									<FileText class="w-3.5 h-3.5 text-[#0593C6] dark:text-sky-300" />
									<span>Draft Penulisan</span>
								</a>

								<div class="my-1 border-t border-sky-200/50 dark:border-white/10"></div>

								<form method="POST" action="/api/logout">
									<button
										type="submit"
										class="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 dark:hover:bg-rose-500/20 transition cursor-pointer text-left"
									>
										<LogOut class="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
										<span>Logout</span>
									</button>
								</form>
							</div>
						{/if}
					</div>
				{/if}

				<!-- Dark / Light Mode Toggle Button -->
				<button
					type="button"
					onclick={toggleTheme}
					class="p-2 rounded-full text-[#061a2e] dark:text-white/80 hover:text-[#0593C6] dark:hover:text-white hover:bg-sky-500/10 dark:hover:bg-white/15 transition-colors cursor-pointer"
					aria-label="Ganti mode terang/gelap"
					title={isDark ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
				>
					{#if isDark}
						<Sun class="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
					{:else}
						<Moon class="w-4 h-4 sm:w-5 sm:h-5 text-[#061a2e]" />
					{/if}
				</button>

				<!-- Search Button (Compact Magnifying Glass Icon) -->
				<button
					type="button"
					onclick={openSearch}
					class="p-2 rounded-full text-[#061a2e] dark:text-white/85 hover:text-[#0593C6] dark:hover:text-white hover:bg-sky-500/10 dark:hover:bg-white/15 transition-colors cursor-pointer"
					aria-label="Cari artikel"
					title="Cari artikel (⌘K)"
				>
					<Search class="w-4 h-4 sm:w-5 sm:h-5 text-[#061a2e] dark:text-white" />
				</button>

				<!-- Mobile Menu Button -->
				<button
					onclick={() => isMobileMenuOpen = !isMobileMenuOpen}
					class="md:hidden p-2 rounded-full text-[#061a2e] dark:text-white hover:bg-sky-500/10 dark:hover:bg-white/15 transition cursor-pointer"
					aria-label="Menu navigasi"
				>
					{#if isMobileMenuOpen}
						<X class="w-5 h-5 text-[#061a2e] dark:text-white" />
					{:else}
						<Menu class="w-5 h-5 text-[#061a2e] dark:text-white" />
					{/if}
				</button>
			</div>
		</header>

		<!-- Scroll Progress Bar Directly Under Topbar -->
		<div class="px-5 mt-1.5 w-full pointer-events-none">
			<div class="w-full h-[3px] bg-sky-200/60 dark:bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
				<div
					class="h-full bg-gradient-to-r from-[#0593C6] via-[#D83995] to-[#f29185] rounded-full transition-all duration-100 ease-out shadow-[0_0_10px_rgba(216,57,149,0.8)]"
					style="width: {scrollProgress}%;"
				></div>
			</div>
		</div>

		<!-- Mobile Floating Glass Dropdown Menu -->
		{#if isMobileMenuOpen}
			<div class="md:hidden mt-2 p-4 rounded-3xl glass-panel space-y-1.5 animate-in fade-in slide-in-from-top-3 duration-200 text-[#061a2e] dark:text-white">
				<button
					type="button"
					onclick={() => { isMobileMenuOpen = false; openSearch(); }}
					class="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-sm font-semibold text-[#061a2e] dark:text-white bg-sky-500/10 dark:bg-white/20 hover:bg-sky-500/15 dark:hover:bg-white/30 transition text-left cursor-pointer"
				>
					<Search class="w-4 h-4 text-[#061a2e] dark:text-white" />
					<span>Cari Tulisan (Search)</span>
				</button>
				<a
					href="/"
					onclick={() => isMobileMenuOpen = false}
					class="block px-4 py-2.5 rounded-2xl text-sm font-semibold text-[#061a2e] dark:text-white hover:bg-sky-500/10 dark:hover:bg-white/15"
				>
					Beranda
				</a>
				<a
					href="/artikel"
					onclick={() => isMobileMenuOpen = false}
					class="block px-4 py-2.5 rounded-2xl text-sm font-semibold text-[#061a2e] dark:text-white hover:bg-sky-500/10 dark:hover:bg-white/15"
				>
					Semua Tulisan
				</a>
				<a
					href="/tentang"
					onclick={() => isMobileMenuOpen = false}
					class="block px-4 py-2.5 rounded-2xl text-sm font-semibold text-[#061a2e] dark:text-white hover:bg-sky-500/10 dark:hover:bg-white/15"
				>
					Filosofi & Tentang
				</a>
				{#if (data as any)?.isAdmin}
					<div class="pt-2 mt-2 border-t border-sky-200/50 dark:border-white/10">
						<a
							href="/admin"
							onclick={() => isMobileMenuOpen = false}
							class="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold text-[#0593C6] dark:text-sky-300 hover:bg-sky-500/10 dark:hover:bg-white/15"
						>
							<FileText class="w-4 h-4" />
							<span>Draft Penulisan</span>
						</a>
						<form method="POST" action="/api/logout">
							<button
								type="submit"
								class="w-full flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 dark:hover:bg-rose-500/20 text-left cursor-pointer"
							>
								<LogOut class="w-4 h-4" />
								<span>Logout</span>
							</button>
						</form>
					</div>
				{/if}
			</div>
		{/if}
	</div>

	<!-- SPOTLIGHT LIQUID GLASS SEARCH POPUP MODAL -->
	{#if isSearchOpen}
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div
			class="fixed inset-0 z-[100] flex flex-col items-center pt-16 sm:pt-24 px-4 bg-black/60 dark:bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
			onclick={(e) => {
				if (e.target === e.currentTarget) closeSearch();
			}}
			onkeydown={(e) => {
				if (e.key === 'Escape') closeSearch();
			}}
			role="dialog"
			aria-modal="true"
			aria-label="Pencarian"
			tabindex="-1"
		>
			<!-- 1. TOP CAPSULE: SEARCH BAR (Without Voice Search) -->
			<div
				class="relative w-full max-w-xl h-14 sm:h-15 px-5 rounded-full bg-[#0a1524]/90 dark:bg-[#060e18]/95 backdrop-blur-3xl border border-white/20 dark:border-white/15 shadow-[0_15px_40px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.3)] flex items-center justify-between text-white"
			>
				<div class="relative flex items-center flex-1 min-w-0 mr-3">
					<!-- Single Glowing Illuminated Line (Placed right at the text position, no duplicate line) -->
					{#if searchQuery === ''}
						<span
							class="w-0.5 h-5 bg-white/95 rounded-full shadow-[0_0_10px_#FCFFFF,0_0_4px_#0593C6] shrink-0 mr-1 pointer-events-none"
						></span>
					{/if}

					<input
						bind:this={searchInputEl}
						bind:value={searchQuery}
						type="text"
						placeholder="Search or Ask..."
						class="w-full bg-transparent text-white placeholder-slate-400 text-base sm:text-lg font-medium focus:outline-none tracking-tight {searchQuery === '' ? 'caret-transparent' : 'caret-white'}"
					/>
				</div>

				<div class="flex items-center gap-2 shrink-0">
					{#if searchQuery}
						<button
							type="button"
							onclick={() => (searchQuery = '')}
							class="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
							aria-label="Hapus kata kunci"
						>
							<X class="w-4 h-4" />
						</button>
					{/if}

					<!-- ESC badge -->
					<button
						type="button"
						onclick={closeSearch}
						class="text-[10px] font-semibold text-slate-400 hover:text-white px-2 py-1 rounded bg-white/10 border border-white/10 transition cursor-pointer"
					>
						ESC
					</button>
				</div>
			</div>

			<!-- 2. BOTTOM FLOATING POPUP CARD (Actual Articles, Newest First, No Shortcut Badges) -->
			<div
				class="relative w-full max-w-xl mt-3 rounded-[28px] bg-[#0a1524]/85 dark:bg-[#060e18]/90 backdrop-blur-3xl border border-white/20 dark:border-white/15 shadow-[0_30px_70px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.25)] p-3 overflow-hidden text-white animate-in zoom-in-95 duration-150"
			>
				<!-- Top Specular Gloss Highlight -->
				<div
					class="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-t-[28px]"
				></div>

				<!-- Dynamic Content: When query is empty vs typed -->
				{#if searchQuery.trim() === ''}
					<!-- Actual Blog Articles / News Listed (Ordered by newest, with 'Terbaru' badge & NO command shortcuts) -->
					<div class="relative z-10">
						<div
							class="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/10 mb-1.5 flex items-center justify-between"
						>
							<span>Tulisan & Berita Terbaru</span>
							<span class="text-[10px] text-slate-400 lowercase font-normal"
								>{(data as any)?.posts?.length || 0} tulisan tersedia</span
							>
						</div>

						<div class="max-h-[380px] overflow-y-auto space-y-1 pr-1">
							{#each (data as any)?.posts || [] as post, idx}
								<button
									type="button"
									onclick={() => navigateTo(`/artikel/${post.slug}`)}
									class="w-full flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-white/15 active:bg-white/20 transition-all text-left group cursor-pointer"
								>
									<div class="flex items-center gap-3.5 min-w-0 mr-3">
										<div
											class="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0 group-hover:scale-105 group-hover:bg-[#0593C6]/30 transition"
										>
											<FileText class="w-4 h-4 text-white" />
										</div>
										<div class="min-w-0">
											<div class="flex items-center gap-2 mb-0.5">
												<span
													class="text-sm font-bold text-white group-hover:text-pink-200 transition-colors truncate"
												>
													{post.metadata.title}
												</span>
												{#if idx === 0}
													<span
														class="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D83995] text-white shadow-xs"
													>
														Terbaru
													</span>
												{/if}
											</div>
											<div class="text-[11px] text-sky-100/75 flex items-center gap-2">
												<span class="text-sky-200 font-medium">{post.metadata.category}</span>
												<span>•</span>
												<span>{post.metadata.date}</span>
												<span>•</span>
												<span>{post.metadata.readTime}</span>
											</div>
										</div>
									</div>
									<div
										class="shrink-0 text-white/40 group-hover:text-white group-hover:translate-x-0.5 transition-all"
									>
										<ArrowRight class="w-4 h-4" />
									</div>
								</button>
							{/each}
						</div>

						<div
							class="pt-2 mt-2 border-t border-white/10 px-2 flex items-center justify-between text-xs text-slate-400"
						>
							<a
								href="/artikel"
								onclick={closeSearch}
								class="hover:text-white text-sky-200 text-xs font-semibold flex items-center gap-1 transition"
							>
								<span>Buka Halaman Arsip Semua Tulisan</span>
								<ArrowRight class="w-3.5 h-3.5" />
							</a>
							<span class="text-[11px] text-slate-400">Tekan ESC untuk tutup</span>
						</div>
					</div>
				{:else}
					<!-- Live Search Results (Clean, without shortcut badges) -->
					<div class="relative z-10">
						{#if searchResults.length > 0}
							<div
								class="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-white/10 mb-1 flex items-center justify-between"
							>
								<span>Ditemukan {searchResults.length} Tulisan</span>
								<span class="text-[10px] lowercase text-slate-400">Gunakan ↑ ↓ ↵</span>
							</div>
							<div class="max-h-[360px] overflow-y-auto space-y-1 pr-1">
								{#each searchResults as post, idx}
									<button
										type="button"
										onclick={() => navigateTo(`/artikel/${post.slug}`)}
										class="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl transition-all text-left group cursor-pointer {idx ===
										activeResultIndex
											? 'bg-white/20 ring-1 ring-white/30'
											: 'hover:bg-white/10'}"
									>
										<div class="flex items-center gap-3 min-w-0 mr-3">
											<div
												class="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-white shrink-0"
											>
												<FileText class="w-4 h-4" />
											</div>
											<div class="min-w-0">
												<div
													class="text-sm font-semibold text-white truncate group-hover:text-pink-200 transition-colors"
												>
													{post.metadata.title}
												</div>
												<div class="text-[11px] text-slate-300 flex items-center gap-2 mt-0.5">
													<span class="text-sky-200 font-medium">{post.metadata.category}</span>
													<span>•</span>
													<span>{post.metadata.date}</span>
													<span>•</span>
													<span>{post.metadata.readTime}</span>
												</div>
											</div>
										</div>
										<div
											class="shrink-0 flex items-center gap-1.5 text-xs text-slate-400 group-hover:text-white"
										>
											<span class="text-[10px] hidden sm:inline">Buka</span>
											<CornerDownLeft class="w-3.5 h-3.5 text-slate-300" />
										</div>
									</button>
								{/each}
							</div>
						{:else}
							<div class="py-10 text-center px-4">
								<p class="text-sm text-slate-300 mb-1">
									Tidak ada tulisan yang cocok dengan "<span class="text-[#f29185] font-semibold"
										>{searchQuery}</span
									>"
								</p>
								<p class="text-xs text-slate-400">
									Cari kata kunci lain atau buka <button
										type="button"
										onclick={() => navigateTo('/artikel')}
										class="text-white underline hover:text-pink-200 font-medium cursor-pointer"
										>semua tulisan</button
									>.
								</p>
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Main Content Slot -->
	<main class="flex-1 pt-4 sm:pt-6">
		{@render children()}
	</main>

	<!-- Footer -->
	<footer class="border-t border-sky-200/60 dark:border-white/15 bg-white/70 dark:bg-black/30 backdrop-blur-2xl py-6 sm:py-7 text-[#334e6b] dark:text-white/80 mt-10 sm:mt-12 transition-colors">
		<div class="max-w-6xl mx-auto px-4 sm:px-6">
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 mb-4 sm:mb-5">
				<!-- Brand Col -->
				<div class="space-y-1.5">
					<div class="flex items-center gap-2">
						<span class="font-extrabold text-base sm:text-lg tracking-tight text-[#061a2e] dark:text-white drop-shadow-sm">911</span>
						<span class="w-1.5 h-1.5 rounded-full bg-[#D83995]"></span>
					</div>
					<p class="text-xs sm:text-[13px] text-[#3a5472] dark:text-sky-50/85 leading-relaxed max-w-lg font-normal">
						Ruang eksplorasi dan esai pribadi untuk membedah dinamika dunia, psikologi mengelola kekayaan, dan strategi membangun otonomi waktu jangka panjang.
					</p>
				</div>

				<!-- Disclaimer Col -->
				<div class="md:text-right flex flex-col md:items-end justify-center">
					<h4 class="text-[11px] font-bold text-[#061a2e] dark:text-white uppercase tracking-wider mb-1">Disclaimer</h4>
					<p class="text-[11px] text-[#527091] dark:text-sky-100/75 leading-relaxed max-w-md">
						Seluruh tulisan di situs ini adalah opini dan refleksi pribadi semata. Bukan merupakan anjuran, rekomendasi, ataupun nasihat finansial resmi.
					</p>
				</div>
			</div>

			<!-- Large Hero Brand Name Typography (Centered with bottom fade gradient) -->
			<div class="pt-1 pb-1 sm:pt-2 sm:pb-2 select-none overflow-hidden flex justify-center items-center text-center">
				<h2
					class="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter leading-none transition-all duration-300 bg-gradient-to-b from-[#061a2e]/35 via-[#061a2e]/18 to-[#061a2e]/0 dark:from-white/22 dark:via-white/10 dark:to-transparent bg-clip-text text-transparent"
					style="mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 35%, rgba(0,0,0,0) 100%); -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 35%, rgba(0,0,0,0) 100%);"
				>
					Adam Alhasni
				</h2>
			</div>

			<div class="pt-4 border-t border-sky-200/50 dark:border-white/15 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-[#53708e] dark:text-sky-100/70">
				<div>
					© {new Date().getFullYear()} Adam Alhasni. Hak cipta dilindungi.
				</div>
				<div class="italic text-center sm:text-right font-medium text-[#53708e] dark:text-sky-100/70">
					Research and education only, not financial advice.
				</div>
			</div>
		</div>
	</footer>

	<!-- Floating Back to Top Button (Smooth slide from bottom with CSS transform & opacity, turns hot pink on hover) -->
	<button
		type="button"
		onclick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
		class="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full glass-panel flex items-center justify-center text-[#061a2e] dark:text-white border border-sky-200/80 dark:border-white/20 shadow-xl shadow-black/10 hover:bg-[#D83995] hover:text-white hover:border-[#D83995] hover:shadow-[#D83995]/40 hover:scale-105 active:scale-95 transition-all duration-500 ease-out cursor-pointer group {showScrollTop ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-10 pointer-events-none'}"
		title="Kembali ke atas"
		aria-label="Kembali ke atas"
	>
		<ArrowUp class="w-5 h-5 transition-transform duration-200 group-hover:-translate-y-0.5" />
	</button>
</div>
