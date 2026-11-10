<script lang="ts">
	import { onMount } from 'svelte';
	import { Plus, X, Pencil, ExternalLink, Eye, FileText, Check } from '@lucide/svelte';

	interface PostItem {
		slug: string;
		metadata: {
			title: string;
			category?: string;
			date?: string;
			readTime?: string;
			status?: string;
			published?: boolean;
			archived?: boolean;
			[key: string]: any;
		};
		views?: number;
	}

	interface Props {
		posts: PostItem[];
		label?: string;
		variant?: 'emerald' | 'amber' | 'purple' | 'cyan';
		isActive?: boolean;
		onSelectFolder?: () => void;
		onEditPost?: (slug: string) => void;
	}

	let {
		posts = [],
		label = 'My Files',
		variant = 'cyan',
		isActive = false,
		onSelectFolder,
		onEditPost
	}: Props = $props();

	let hovered = $state(false);
	let pinned = $state(false);
	let selectedSlug = $state<string | null>(null);

	// Unique ID per instance for SVG clip-path
	let id = $state('folder-' + Math.random().toString(36).substring(2, 9));
	onMount(() => {
		id = 'folder-' + Math.random().toString(36).substring(2, 9);
	});

	const open = $derived(hovered || pinned);

	// Limit to max 4 cards for optimal fanning visual clarity
	const displayPosts = $derived(posts.slice(0, 4));

	function getVariantClasses(v: 'emerald' | 'amber' | 'purple' | 'cyan') {
		switch (v) {
			case 'emerald':
				return {
					dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
					badge: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
					actionBtn: 'bg-emerald-500 text-white shadow-emerald-500/30 hover:bg-emerald-600',
					activeBorder: 'border-emerald-400 dark:border-emerald-400/80 shadow-[0_0_20px_rgba(16,185,129,0.25)]',
					glow: 'from-emerald-500/10 via-teal-500/5 to-transparent'
				};
			case 'amber':
				return {
					dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]',
					badge: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30',
					actionBtn: 'bg-amber-500 text-white shadow-amber-500/30 hover:bg-amber-600',
					activeBorder: 'border-amber-400 dark:border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.25)]',
					glow: 'from-amber-500/10 via-yellow-500/5 to-transparent'
				};
			case 'purple':
				return {
					dot: 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.6)]',
					badge: 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30',
					actionBtn: 'bg-purple-500 text-white shadow-purple-500/30 hover:bg-purple-600',
					activeBorder: 'border-purple-400 dark:border-purple-400/80 shadow-[0_0_20px_rgba(168,85,247,0.25)]',
					glow: 'from-purple-500/10 via-pink-500/5 to-transparent'
				};
			default:
				return {
					dot: 'bg-[#0593C6] shadow-[0_0_8px_rgba(5,147,198,0.6)]',
					badge: 'bg-[#0593C6]/20 text-[#0593C6] dark:text-sky-300 border-[#0593C6]/30',
					actionBtn: 'bg-[#0593C6] text-white shadow-[#0593C6]/30 hover:bg-[#047ea8]',
					activeBorder: 'border-[#0593C6] dark:border-sky-400 shadow-[0_0_20px_rgba(5,147,198,0.25)]',
					glow: 'from-[#0593C6]/10 via-[#D83995]/5 to-transparent'
				};
		}
	}

	const styles = $derived(getVariantClasses(variant));

	function getPostBg(category?: string) {
		switch (category) {
			case 'Mindset Keuangan':
				return 'from-[#180e2b] via-[#0b1528] to-[#250d22] border-pink-400/30';
			case 'Opini Dunia':
				return 'from-[#1e1308] via-[#091624] to-[#1c0f18] border-amber-400/30';
			default:
				return 'from-[#061a2e] via-[#09223a] to-[#041220] border-sky-400/30';
		}
	}

	function getCardTransform(index: number, total: number, active: boolean, isOpen: boolean, isPinned: boolean) {
		const offset = total > 1 ? index / (total - 1) - 0.5 : 0;
		if (isPinned) {
			const x = offset * 115;
			const y = active ? -165 : -140 + Math.abs(offset) * 22;
			const rot = active ? 0 : offset * 15;
			const sc = active ? 1.08 : 1;
			return `transform: translate3d(${x}px, ${y}px, 0) rotate(${rot}deg) scale(${sc}); z-index: ${active ? 45 : 10 + index};`;
		}
		if (isOpen) {
			const x = offset * 14;
			const y = active ? -75 : -32 - index * 14;
			const rot = offset * 6;
			const sc = active ? 1.03 : 1;
			return `transform: translate3d(${x}px, ${y}px, 0) rotate(${rot}deg) scale(${sc}); z-index: ${active ? 30 : 10 + index};`;
		}
		const y = -index * 6;
		const rot = offset * 2;
		return `transform: translate3d(0, ${y}px, 0) rotate(${rot}deg) scale(1); z-index: ${10 + index};`;
	}

	function togglePinned(e: MouseEvent) {
		e.stopPropagation();
		pinned = !pinned;
		if (!pinned) {
			selectedSlug = null;
		}
		if (onSelectFolder) onSelectFolder();
	}

	function handleCardClick(slug: string, e: MouseEvent) {
		e.stopPropagation();
		pinned = true;
		selectedSlug = selectedSlug === slug ? null : slug;
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	class="article-folder relative h-[215px] w-full select-none transition-all duration-300 {isActive ? 'scale-[1.02]' : 'hover:scale-[1.01]'}"
	onpointerenter={(e) => {
		if (e.pointerType === 'mouse') hovered = true;
	}}
	onpointerleave={() => {
		hovered = false;
		if (!pinned) selectedSlug = null;
	}}
	onkeydown={(e) => {
		if (e.key === 'Escape') {
			pinned = false;
			hovered = false;
			selectedSlug = null;
		}
	}}
	role="region"
	aria-label="Folder artikel {label}"
>
	<!-- SVG Defs for Custom Folder Tabs -->
	<svg width="0" height="0" class="absolute pointer-events-none" aria-hidden="true">
		<defs>
			<clipPath id="{id}-back" clipPathUnits="objectBoundingBox">
				<path d="M0,.24 Q0,.14 .07,.14 H.44 Q.48,.14 .51,.09 L.56,.03 Q.59,0 .64,0 H.93 Q1,0 1,.1 V.9 Q1,1 .93,1 H.07 Q0,1 0,.9 Z" />
			</clipPath>
			<clipPath id="{id}-front" clipPathUnits="objectBoundingBox">
				<path d="M0,.1 Q0,0 .07,0 H.35 Q.39,0 .42,.04 L.48,.12 Q.51,.16 .56,.16 H.93 Q1,.16 1,.26 V.9 Q1,1 .93,1 H.07 Q0,1 0,.9 Z" />
			</clipPath>
		</defs>
	</svg>

	<!-- FOLDER BACK TAB -->
	<div
		class="folder-tab-back absolute bottom-5 h-[142px] w-full transition-all duration-300"
		style="clip-path: url(#{id}-back);"
		aria-hidden="true"
	>
		<!-- Subtle Top Gradient Highlight on Back Flap -->
		<div class="w-full h-full bg-gradient-to-br {styles.glow} opacity-60"></div>
	</div>

	<!-- FOLDER CONTENT: SLIDING ARTICLE CARDS -->
	{#if displayPosts.length > 0}
		{#each displayPosts as post, i}
			{@const active = selectedSlug === post.slug}
			{@const transform = getCardTransform(i, displayPosts.length, active, open, pinned)}

			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<div
				class="article-file-card absolute bottom-[30px] left-[8%] h-[114px] w-[84%] rounded-xl overflow-hidden shadow-xl cursor-pointer transition-all duration-300 ease-out border bg-gradient-to-br text-white {getPostBg(post.metadata?.category)} {active ? 'ring-2 ring-white/70 shadow-2xl' : 'hover:border-white/50'}"
				style="{transform}"
				onclick={(e) => handleCardClick(post.slug, e)}
				role="button"
				tabindex="0"
				aria-label="Artikel: {post.metadata?.title}"
				aria-pressed={active}
			>
				<div class="h-full w-full p-2.5 flex flex-col justify-between relative overflow-hidden backdrop-blur-md">
					<!-- Glossy Glass Refraction Layer -->
					<div class="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent pointer-events-none"></div>

					<!-- Card Header -->
					<div class="flex items-center justify-between text-[9px] relative z-10 font-semibold text-sky-200/90">
						<span class="px-1.5 py-0.5 rounded-md bg-white/10 dark:bg-black/30 border border-white/20 truncate max-w-[90px]">
							{post.metadata?.category || 'Artikel'}
						</span>
						<span class="text-[9px] font-mono opacity-70">
							{post.metadata?.date || ''}
						</span>
					</div>

					<!-- Card Title -->
					<div class="relative z-10 my-0.5">
						<h4 class="text-[11px] font-bold line-clamp-2 leading-tight text-white drop-shadow-xs">
							{post.metadata?.title}
						</h4>
					</div>

					<!-- Card Footer / Actions when Active -->
					<div class="relative z-10 flex items-center justify-between text-[9px]">
						{#if active}
							<div class="flex items-center gap-1.5 w-full justify-end pt-0.5 animate-in fade-in duration-150">
								{#if onEditPost}
									<button
										type="button"
										onclick={(e) => {
											e.stopPropagation();
											onEditPost(post.slug);
										}}
										class="px-2 py-0.5 rounded-md bg-[#0593C6] hover:bg-[#047ea8] text-white font-bold text-[10px] flex items-center gap-1 shadow-xs transition"
									>
										<Pencil class="w-2.5 h-2.5" />
										<span>Edit</span>
									</button>
								{/if}
								<a
									href="/artikel/{post.slug}"
									target="_blank"
									onclick={(e) => e.stopPropagation()}
									class="px-2 py-0.5 rounded-md bg-white/20 hover:bg-white/30 text-white font-bold text-[10px] flex items-center gap-1 shadow-xs transition"
								>
									<span>Buka</span>
									<ExternalLink class="w-2.5 h-2.5" />
								</a>
							</div>
						{:else}
							<div class="flex items-center gap-1 text-[10px] opacity-75">
								<Eye class="w-3 h-3" />
								<span>{post.views ?? 0}</span>
							</div>
							<span class="text-[9px] text-white/50 italic">
								{pinned ? 'Klik detail' : ''}
							</span>
						{/if}
					</div>
				</div>
			</div>
		{/each}
	{:else}
		<!-- EMPTY FOLDER PLACEHOLDER -->
		<div
			class="article-file-card absolute bottom-[30px] left-[8%] h-[114px] w-[84%] rounded-xl overflow-hidden shadow-md border border-dashed border-sky-300/40 dark:border-white/20 bg-sky-500/5 dark:bg-white/5 text-[#061a2e] dark:text-white flex flex-col items-center justify-center p-3 text-center transition-all duration-300"
			style="transform: translate3d(0, 0, 0); z-index: 10;"
		>
			<FileText class="w-6 h-6 opacity-30 mb-1" />
			<span class="text-[11px] font-semibold opacity-70">Belum ada artikel</span>
			<span class="text-[9px] opacity-40 font-mono">Folder kosong</span>
		</div>
	{/if}

	<!-- FOLDER FRONT FLAP (3D Liquid Glass) -->
	<div
		class="folder-tab-front pointer-events-none absolute bottom-5 z-20 h-[124px] w-full transition-all duration-300 ease-out"
		style="clip-path: url(#{id}-front); transform-origin: bottom center; transform-style: preserve-3d; transform: perspective(800px) rotateX({pinned ? -26 : open ? -13 : 0}deg) translateY({open ? 4 : 0}px);"
		aria-hidden="true"
	>
		<!-- Glossy Refraction Sheen on Glass Flap -->
		<div class="w-full h-full bg-gradient-to-br from-white/30 via-white/10 to-transparent dark:from-white/15 dark:to-transparent"></div>
	</div>

	<!-- FOLDER CONTROL BAR -->
	<button
		type="button"
		onclick={togglePinned}
		class="folder-control-bar absolute bottom-5 z-30 h-[92px] w-full flex items-end justify-between px-4 pb-3.5 pt-0 text-left cursor-pointer rounded-2xl select-none transition-colors"
		aria-label="{pinned ? 'Tutup' : 'Buka'} folder {label}"
		aria-expanded={open}
	>
		<!-- Left: Label & Counter -->
		<div
			class="flex flex-col gap-0.5 transition-transform duration-300"
			style="transform: translateY({open ? 3 : 0}px);"
		>
			<span class="text-xs font-black tracking-tight text-[#061a2e] dark:text-white flex items-center gap-1.5">
				<span class="w-2 h-2 rounded-full {styles.dot}"></span>
				<span>{label}</span>
				{#if isActive}
					<span class="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#0593C6]/20 text-[#0593C6] dark:text-sky-300">Aktif</span>
				{/if}
			</span>
			<span class="font-mono text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
				{posts.length} artikel
			</span>
		</div>

		<!-- Right: Action Button (+ / X) -->
		<div
			class="size-7 grid place-items-center rounded-xl font-bold shadow-md transition-all duration-200 hover:scale-110 active:scale-95 {styles.actionBtn}"
			style="transform: translateY({open ? 3 : 0}px);"
		>
			{#if pinned}
				<X class="w-3.5 h-3.5" />
			{:else}
				<Plus class="w-3.5 h-3.5" />
			{/if}
		</div>
	</button>

	<!-- BOTTOM ACTIVE POST LABEL -->
	{#if selectedSlug}
		{@const currentPost = posts.find((p) => p.slug === selectedSlug)}
		{#if currentPost}
			<div class="absolute bottom-0 left-0 w-full text-center px-2 animate-in fade-in duration-200">
				<span class="inline-block text-[10px] font-mono text-[#0593C6] dark:text-sky-300 truncate max-w-full font-bold">
					📄 {currentPost.metadata.title}
				</span>
			</div>
		{/if}
	{/if}
</div>

<style>
	/* Pelmatech Liquid Glass Frosted Folder Styles */
	.folder-tab-back {
		background: color-mix(in oklab, var(--card, #ffffff) 25%, transparent);
		box-shadow: inset 0 1px 0 color-mix(in oklab, #ffffff 65%, transparent);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
	}

	:global(.dark) .folder-tab-back {
		background: color-mix(in oklab, #0f2438 45%, transparent);
		box-shadow: inset 0 1px 0 color-mix(in oklab, #ffffff 18%, transparent);
	}

	.folder-tab-front {
		background: linear-gradient(
			160deg,
			color-mix(in oklab, #ffffff 55%, transparent),
			color-mix(in oklab, #ffffff 20%, transparent)
		);
		backdrop-filter: blur(14px);
		-webkit-backdrop-filter: blur(14px);
		box-shadow:
			inset 0 1.5px 1.5px color-mix(in oklab, #ffffff 85%, transparent),
			inset 0 -1px 1px color-mix(in oklab, #000000 8%, transparent);
	}

	:global(.dark) .folder-tab-front {
		background: linear-gradient(
			160deg,
			color-mix(in oklab, #071727 75%, transparent),
			color-mix(in oklab, #020b14 90%, transparent)
		);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		box-shadow:
			inset 0 1.5px 1.5px color-mix(in oklab, #ffffff 28%, transparent),
			inset 0 -1px 1px color-mix(in oklab, #000000 30%, transparent);
	}

	.article-folder {
		filter: drop-shadow(0 14px 16px color-mix(in oklab, #000000 12%, transparent));
	}

	:global(.dark) .article-folder {
		filter: drop-shadow(0 16px 20px color-mix(in oklab, #000000 45%, transparent));
	}

	.article-file-card {
		transform-origin: bottom center;
		backface-visibility: hidden;
		-webkit-backface-visibility: hidden;
	}
</style>
