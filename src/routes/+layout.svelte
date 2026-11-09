<script lang="ts">
	import './layout.css';
	import type { LayoutProps } from './$types';
	import {
		Menu,
		X,
		Sun,
		Moon,
		Search,
		Mic,
		BookOpen,
		Folder,
		Layers,
		Clipboard,
		FileText,
		CornerDownLeft
	} from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let { data, children }: LayoutProps = $props();
	let isMobileMenuOpen = $state(false);
	let isDark = $state(false);
	let scrollProgress = $state(0);

	// Search Modal State
	let isSearchOpen = $state(false);
	let searchQuery = $state('');
	let searchInputEl = $state<HTMLInputElement | null>(null);
	let isListening = $state(false);
	let activeResultIndex = $state(0);

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

	function openSearch() {
		isSearchOpen = true;
		searchQuery = '';
		activeResultIndex = 0;
		setTimeout(() => searchInputEl?.focus(), 60);
	}

	function closeSearch() {
		isSearchOpen = false;
		searchQuery = '';
		if (isListening) isListening = false;
	}

	function navigateTo(url: string) {
		closeSearch();
		isMobileMenuOpen = false;
		goto(url);
	}

	function toggleVoiceSearch() {
		if (typeof window === 'undefined') return;
		const SpeechRecognition =
			(window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
		if (!SpeechRecognition) {
			alert('Browser Anda belum mendukung input suara.');
			return;
		}

		if (isListening) {
			isListening = false;
			return;
		}

		try {
			const recognition = new SpeechRecognition();
			recognition.lang = 'id-ID';
			recognition.interimResults = false;
			recognition.maxAlternatives = 1;

			recognition.onstart = () => {
				isListening = true;
			};
			recognition.onresult = (event: any) => {
				const transcript = event.results[0][0].transcript;
				searchQuery = transcript;
				isListening = false;
			};
			recognition.onerror = () => {
				isListening = false;
			};
			recognition.onend = () => {
				isListening = false;
			};
			recognition.start();
		} catch (e) {
			isListening = false;
		}
	}

	// Dynamic search filtering
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

		// Escape closes search modal
		if (e.key === 'Escape' && isSearchOpen) {
			e.preventDefault();
			closeSearch();
			return;
		}

		// Quick shortcuts when search is open
		if (isSearchOpen) {
			// Cmd+1 .. Cmd+4
			if (e.metaKey || e.ctrlKey) {
				if (e.key === '1') {
					e.preventDefault();
					navigateTo('/artikel');
					return;
				} else if (e.key === '2') {
					e.preventDefault();
					navigateTo('/artikel?cat=Mindset+Keuangan');
					return;
				} else if (e.key === '3') {
					e.preventDefault();
					navigateTo('/artikel?cat=Opini+Dunia');
					return;
				} else if (e.key === '4') {
					e.preventDefault();
					navigateTo('/tentang');
					return;
				}
			}

			// Arrow keys navigation for search results
			if (searchResults.length > 0) {
				if (e.key === 'ArrowDown') {
					e.preventDefault();
					activeResultIndex = (activeResultIndex + 1) % searchResults.length;
				} else if (e.key === 'ArrowUp') {
					e.preventDefault();
					activeResultIndex = (activeResultIndex - 1 + searchResults.length) % searchResults.length;
				} else if (e.key === 'Enter') {
					e.preventDefault();
					const selected = searchResults[activeResultIndex];
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
		updateScroll();
		return () => {
			window.removeEventListener('scroll', updateScroll);
			window.removeEventListener('keydown', handleKeydown);
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

<div class="min-h-screen flex flex-col pelma-bg text-white selection:bg-[#D83995] selection:text-white transition-colors duration-200">
	<!-- FLOATING LIQUID GLASS TOPBAR & SCROLL PROGRESS WRAPPER -->
	<div class="sticky top-3 sm:top-5 z-50 px-3 sm:px-6 w-full max-w-5xl mx-auto">
		<!-- Liquid Glass Capsule Topbar -->
		<header class="relative rounded-full glass-panel px-4 sm:px-6 h-15 sm:h-16 flex items-center justify-between text-white transition-all duration-300">
			<!-- Brand Logo -->
			<a href="/" class="flex items-center gap-2.5 group">
				<div class="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 border border-white/30 text-white flex items-center justify-center font-black text-base sm:text-lg shadow-sm group-hover:scale-105 transition-transform backdrop-blur-md">
					<span>A</span>
					<span class="w-1.5 h-1.5 rounded-full bg-[#D83995] ml-0.5 -mt-2"></span>
				</div>
				<span class="font-black text-xl sm:text-2xl tracking-tight text-white group-hover:text-pink-200 transition-colors drop-shadow-sm">
					911
				</span>
			</a>

			<!-- Desktop Navigation Links -->
			<nav class="hidden md:flex items-center gap-1 sm:gap-1.5">
				<a
					href="/"
					class="px-4 py-1.5 rounded-full text-sm font-medium text-white/85 hover:text-white hover:bg-white/15 transition-all"
				>
					Beranda
				</a>
				<a
					href="/artikel"
					class="px-4 py-1.5 rounded-full text-sm font-medium text-white/85 hover:text-white hover:bg-white/15 transition-all"
				>
					Semua Tulisan
				</a>
				<a
					href="/tentang"
					class="px-4 py-1.5 rounded-full text-sm font-medium text-white/85 hover:text-white hover:bg-white/15 transition-all"
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
					class="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
					aria-label="Ganti mode terang/gelap"
					title={isDark ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
				>
					{#if isDark}
						<Sun class="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
					{:else}
						<Moon class="w-4 h-4 sm:w-5 sm:h-5 text-white" />
					{/if}
				</button>

				<!-- Search Bar Capsule (Replaces 'Jelajahi' like in Image 2) -->
				<button
					type="button"
					onclick={openSearch}
					class="flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full glass-pill hover:bg-white/25 text-white transition-all cursor-pointer shadow-sm group active:scale-95"
					aria-label="Search or Ask"
					title="Cari artikel (⌘K)"
				>
					<Search class="w-3.5 h-3.5 text-white/90 group-hover:scale-110 transition-transform" />
					<span class="hidden sm:inline text-xs font-medium text-white/90 group-hover:text-white transition-colors">Search or Ask</span>
					<kbd class="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-white/85 bg-white/20 rounded border border-white/25">⌘K</kbd>
				</button>

				<!-- Mobile Menu Button -->
				<button
					onclick={() => isMobileMenuOpen = !isMobileMenuOpen}
					class="md:hidden p-2 rounded-full text-white/90 hover:bg-white/15 transition cursor-pointer"
					aria-label="Menu navigasi"
				>
					{#if isMobileMenuOpen}
						<X class="w-5 h-5 text-white" />
					{:else}
						<Menu class="w-5 h-5 text-white" />
					{/if}
				</button>
			</div>
		</header>

		<!-- Scroll Progress Bar Directly Under Topbar -->
		<div class="px-5 mt-1.5 w-full pointer-events-none">
			<div class="w-full h-[3px] bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
				<div
					class="h-full bg-gradient-to-r from-white via-[#D83995] to-[#f29185] rounded-full transition-all duration-100 ease-out shadow-[0_0_10px_rgba(216,57,149,0.8)]"
					style="width: {scrollProgress}%;"
				></div>
			</div>
		</div>

		<!-- Mobile Floating Glass Dropdown Menu -->
		{#if isMobileMenuOpen}
			<div class="md:hidden mt-2 p-4 rounded-3xl glass-panel space-y-1.5 animate-in fade-in slide-in-from-top-3 duration-200">
				<button
					type="button"
					onclick={() => { isMobileMenuOpen = false; openSearch(); }}
					class="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-sm font-semibold text-white bg-white/20 hover:bg-white/30 transition text-left cursor-pointer"
				>
					<Search class="w-4 h-4 text-white" />
					<span>Search or Ask (⌘K)</span>
				</button>
				<a
					href="/"
					onclick={() => isMobileMenuOpen = false}
					class="block px-4 py-2.5 rounded-2xl text-sm font-semibold text-white hover:bg-white/15"
				>
					Beranda
				</a>
				<a
					href="/artikel"
					onclick={() => isMobileMenuOpen = false}
					class="block px-4 py-2.5 rounded-2xl text-sm font-semibold text-white hover:bg-white/15"
				>
					Semua Tulisan
				</a>
				<a
					href="/tentang"
					onclick={() => isMobileMenuOpen = false}
					class="block px-4 py-2.5 rounded-2xl text-sm font-semibold text-white hover:bg-white/15"
				>
					Tentang Saya
				</a>
			</div>
		{/if}
	</div>

	<!-- SPOTLIGHT LIQUID GLASS SEARCH POPUP MODAL (Matching Image 2) -->
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
			<!-- 1. TOP CAPSULE: SEARCH OR ASK (Matching Image 2) -->
			<div
				class="relative w-full max-w-xl h-14 sm:h-15 px-5 rounded-full bg-[#0a1524]/90 dark:bg-[#060e18]/95 backdrop-blur-3xl border border-white/20 dark:border-white/15 shadow-[0_15px_40px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.3)] flex items-center justify-between text-white"
			>
				<div class="flex items-center gap-3 flex-1 min-w-0 mr-3">
					<!-- Illuminated Glowing Cursor Line on the left (Like Image 2) -->
					<span
						class="w-0.5 h-6 bg-white/95 rounded-full shadow-[0_0_10px_#FCFFFF,0_0_4px_#0593C6] animate-pulse shrink-0"
					></span>

					<input
						bind:this={searchInputEl}
						bind:value={searchQuery}
						type="text"
						placeholder="Search or Ask"
						class="w-full bg-transparent text-white placeholder-slate-400 text-base sm:text-lg font-medium focus:outline-none tracking-tight"
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

					<!-- Microphone Icon (Voice Input) like Image 2 -->
					<button
						type="button"
						onclick={toggleVoiceSearch}
						class="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer {isListening
							? 'text-[#D83995] animate-pulse'
							: ''}"
						aria-label="Input Suara"
						title={isListening ? 'Mendengarkan...' : 'Pencarian Suara'}
					>
						<Mic class="w-5 h-5" />
					</button>

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

			<!-- 2. BOTTOM FLOATING POPUP CARD (Matching Image 2) -->
			<div
				class="relative w-full max-w-xl mt-3 rounded-[28px] bg-[#0a1524]/85 dark:bg-[#060e18]/90 backdrop-blur-3xl border border-white/20 dark:border-white/15 shadow-[0_30px_70px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.25)] p-3 overflow-hidden text-white animate-in zoom-in-95 duration-150"
			>
				<!-- Top Specular Gloss Highlight -->
				<div
					class="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-t-[28px]"
				></div>

				<!-- Dynamic Content: When query is empty vs typed -->
				{#if searchQuery.trim() === ''}
					<!-- Quick Default Items (Exactly like Applications, Files, Actions, Clipboard in Image 2) -->
					<div class="space-y-1 relative z-10">
						<!-- Row 1: Applications -->
						<button
							type="button"
							onclick={() => navigateTo('/artikel')}
							class="w-full flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-white/15 active:bg-white/20 transition-all text-left group cursor-pointer"
						>
							<div class="flex items-center gap-3.5">
								<div
									class="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-slate-200 group-hover:scale-105 group-hover:text-white transition"
								>
									<BookOpen class="w-4 h-4" />
								</div>
								<div>
									<div class="text-sm font-semibold text-slate-100 group-hover:text-white">
										Applications
									</div>
									<div class="text-[11px] text-slate-400">Semua Tulisan & Arsip Pemikiran</div>
								</div>
							</div>
							<span
								class="text-xs font-semibold text-amber-200/80 group-hover:text-amber-200 px-2 py-0.5 rounded bg-white/5 border border-white/10"
								>⌘1</span
							>
						</button>

						<!-- Row 2: Files -->
						<button
							type="button"
							onclick={() => navigateTo('/artikel?cat=Mindset+Keuangan')}
							class="w-full flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-white/15 active:bg-white/20 transition-all text-left group cursor-pointer"
						>
							<div class="flex items-center gap-3.5">
								<div
									class="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-slate-200 group-hover:scale-105 group-hover:text-white transition"
								>
									<Folder class="w-4 h-4" />
								</div>
								<div>
									<div class="text-sm font-semibold text-slate-100 group-hover:text-white">
										Files
									</div>
									<div class="text-[11px] text-slate-400">Mindset Keuangan & Investasi</div>
								</div>
							</div>
							<span
								class="text-xs font-semibold text-amber-200/80 group-hover:text-amber-200 px-2 py-0.5 rounded bg-white/5 border border-white/10"
								>⌘2</span
							>
						</button>

						<!-- Row 3: Actions -->
						<button
							type="button"
							onclick={() => navigateTo('/artikel?cat=Opini+Dunia')}
							class="w-full flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-white/15 active:bg-white/20 transition-all text-left group cursor-pointer"
						>
							<div class="flex items-center gap-3.5">
								<div
									class="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-slate-200 group-hover:scale-105 group-hover:text-white transition"
								>
									<Layers class="w-4 h-4" />
								</div>
								<div>
									<div class="text-sm font-semibold text-slate-100 group-hover:text-white">
										Actions
									</div>
									<div class="text-[11px] text-slate-400">Opini Dunia & Analisis Geopolitik</div>
								</div>
							</div>
							<span
								class="text-xs font-semibold text-amber-200/80 group-hover:text-amber-200 px-2 py-0.5 rounded bg-white/5 border border-white/10"
								>⌘3</span
							>
						</button>

						<!-- Row 4: Clipboard -->
						<button
							type="button"
							onclick={() => navigateTo('/tentang')}
							class="w-full flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-white/15 active:bg-white/20 transition-all text-left group cursor-pointer"
						>
							<div class="flex items-center gap-3.5">
								<div
									class="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-slate-200 group-hover:scale-105 group-hover:text-white transition"
								>
									<Clipboard class="w-4 h-4" />
								</div>
								<div>
									<div class="text-sm font-semibold text-slate-100 group-hover:text-white">
										Clipboard
									</div>
									<div class="text-[11px] text-slate-400">Filosofi Hidup & Profil 911</div>
								</div>
							</div>
							<span
								class="text-xs font-semibold text-amber-200/80 group-hover:text-amber-200 px-2 py-0.5 rounded bg-white/5 border border-white/10"
								>⌘4</span
							>
						</button>
					</div>
				{:else}
					<!-- Live Search Results -->
					<div class="relative z-10">
						{#if searchResults.length > 0}
							<div
								class="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-white/10 mb-1 flex items-center justify-between"
							>
								<span>Ditemukan {searchResults.length} Tulisan</span>
								<span class="text-[10px] lowercase text-slate-400">Gunakan ↑ ↓ ↵</span>
							</div>
							<div class="max-h-[340px] overflow-y-auto space-y-1 pr-1">
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
												class="w-8 h-8 rounded-xl bg-[#0593C6]/20 border border-[#0593C6]/30 flex items-center justify-center text-[#0593C6] shrink-0"
											>
												<FileText class="w-4 h-4" />
											</div>
											<div class="min-w-0">
												<div
													class="text-sm font-semibold text-white truncate group-hover:text-[#0593C6] transition-colors"
												>
													{post.metadata.title}
												</div>
												<div class="text-[11px] text-slate-300 flex items-center gap-2 mt-0.5">
													<span class="text-[#D83995] font-medium">{post.metadata.category}</span>
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
										class="text-[#0593C6] hover:underline font-medium cursor-pointer"
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
	<footer class="border-t border-white/20 bg-black/20 backdrop-blur-2xl py-12 text-white/80 mt-20 transition-colors">
		<div class="max-w-6xl mx-auto px-4 sm:px-6">
			<div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
				<!-- Brand Col -->
				<div class="md:col-span-2 space-y-3">
					<div class="flex items-center gap-2">
						<span class="font-extrabold text-xl tracking-tight text-white drop-shadow-sm">911</span>
						<span class="w-1.5 h-1.5 rounded-full bg-[#D83995]"></span>
					</div>
					<p class="text-sm text-sky-50/85 leading-relaxed max-w-md font-normal">
						Ruang eksplorasi dan esai pribadi untuk membedah dinamika dunia, psikologi mengelola kekayaan, dan strategi membangun otonomi waktu jangka panjang.
					</p>
				</div>

				<!-- Nav Links Col -->
				<div>
					<h4 class="text-xs font-bold text-white uppercase tracking-wider mb-4">Navigasi</h4>
					<ul class="space-y-2.5 text-sm">
						<li><a href="/" class="text-white/80 hover:text-white transition">Beranda</a></li>
						<li><a href="/artikel" class="text-white/80 hover:text-white transition">Kumpulan Tulisan</a></li>
						<li><a href="/tentang" class="text-white/80 hover:text-white transition">Filosofi & Tentang</a></li>
					</ul>
				</div>

				<!-- Disclaimer Col -->
				<div>
					<h4 class="text-xs font-bold text-white uppercase tracking-wider mb-4">Disclaimer</h4>
					<p class="text-xs text-sky-100/75 leading-relaxed">
						Seluruh tulisan di situs ini adalah opini dan refleksi pribadi semata. Bukan merupakan anjuran, rekomendasi, ataupun nasihat finansial resmi.
					</p>
				</div>
			</div>

			<div class="pt-8 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-sky-100/70">
				<div>
					© {new Date().getFullYear()} 911. Hak cipta dilindungi.
				</div>
				<div>
					<button onclick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} class="hover:text-white text-white/80 transition cursor-pointer flex items-center gap-1">
						<span>Ke Atas</span>
						<span>↑</span>
					</button>
				</div>
			</div>
		</div>
	</footer>
</div>
