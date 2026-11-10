<script lang="ts">
	import type { PageProps, ActionData } from './$types';
	import { onMount } from 'svelte';
	import { marked } from 'marked';
	import {
		Eye,
		EyeOff,
		Check,
		AlertCircle,
		Sparkles,
		Calendar,
		Clock,
		FileText,
		Layers,
		Quote,
		List,
		Code,
		Heading2,
		Heading3,
		Bold,
		Italic,
		Table,
		Lock,
		User,
		LogOut,
		Upload,
		Bookmark,
		Trash2,
		Undo2,
		Pencil,
		Archive,
		Share2,
		FolderOpen,
		X
	} from '@lucide/svelte';
	import ArticleFolder from '#lib/components/ArticleFolder.svelte';

	let { data, form }: PageProps & { form: ActionData } = $props();

	const totalViews = $derived(
		Object.values((data as any)?.views || {}).reduce(
			(acc: number, curr: any) => acc + (Number(curr) || 0),
			0
		)
	);

	const postsWithViews = $derived(
		(data.posts || []).map((p: any) => ({
			...p,
			views: (data.views && (data.views as any)[p.slug]) || 0
		}))
	);

	const uploadPosts = $derived(
		postsWithViews.filter((p: any) => {
			const st = p.metadata?.status || (p.metadata?.archived ? 'arsip' : (p.metadata?.published !== false ? 'upload' : 'draft'));
			return st === 'upload';
		})
	);

	const draftPosts = $derived(
		postsWithViews.filter((p: any) => {
			const st = p.metadata?.status || (p.metadata?.archived ? 'arsip' : (p.metadata?.published !== false ? 'upload' : 'draft'));
			return st === 'draft';
		})
	);

	const arsipPosts = $derived(
		postsWithViews.filter((p: any) => {
			const st = p.metadata?.status || (p.metadata?.archived ? 'arsip' : (p.metadata?.published !== false ? 'upload' : 'draft'));
			return st === 'arsip';
		})
	);

	const uploadCount = $derived(uploadPosts.length);
	const draftCount = $derived(draftPosts.length);
	const arsipCount = $derived(arsipPosts.length);

	let dashboardFilter = $state<'semua' | 'upload' | 'draft' | 'arsip'>('semua');
	let openedFolder = $state<'upload' | 'draft' | 'arsip' | 'semua' | null>(null);

	function handleToggleFolder(folderKey: 'upload' | 'draft' | 'arsip' | 'semua') {
		if (openedFolder === folderKey) {
			openedFolder = null;
		} else {
			openedFolder = folderKey;
			dashboardFilter = folderKey;
		}
	}

	let viewingReferrerPost = $state<{ slug: string; title: string; referrers: Record<string, number>; total: number } | null>(null);

	function formatPlatformName(key: string): string {
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

	const filteredPosts = $derived(
		(data.posts || []).filter((p: any) => {
			if (dashboardFilter === 'semua') return true;
			const st = p.metadata?.status || (p.metadata?.archived ? 'arsip' : (p.metadata?.published !== false ? 'upload' : 'draft'));
			return st === dashboardFilter;
		})
	);

	// Login State
	let showPassword = $state(false);

	// Editor Form State
	let title = $state('');
	let slug = $state('');
	let category = $state('Investasi');
	let readTime = $state('5 min baca');
	let description = $state('');
	let tags = $state('Investasi, Keuangan, Mindset');
	let content = $state(
`Di sini Anda bisa langsung mengetik pemikiran Anda...

### Pelajaran Penting Hari Ini

Tuliskan poin-poin utama Anda:
* Poin pertama tentang realita pasar
* Poin kedua tentang pengelolaan modal
* Poin ketiga tentang otonomi waktu

> "Dividen tertinggi dari uang adalah kebebasan untuk menentukan hari Anda sendiri."

Bagikan refleksi penutup Anda di sini.`
	);

	// UI State
	let activeTab = $state<'editor' | 'preview' | 'split'>('split');
	let isSaving = $state(false);
	let saveMessage = $state<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

	// Autosave & Undo State
	const AUTOSAVE_STORAGE_KEY = 'adam_admin_autosave_temp_v1';
	let autoSaveStatus = $state<string>('');
	let autoSaveTimeout: any = null;

	let contentHistory = $state<string[]>([]);
	let historyIndex = $state(-1);
	let isUndoOperation = false;

	function pushHistory(newContent: string) {
		if (isUndoOperation) return;
		if (historyIndex >= 0 && contentHistory[historyIndex] === newContent) return;
		const next = contentHistory.slice(0, historyIndex + 1);
		next.push(newContent);
		if (next.length > 50) next.shift();
		contentHistory = next;
		historyIndex = next.length - 1;
	}

	function handleUndo() {
		if (historyIndex > 0) {
			historyIndex -= 1;
			isUndoOperation = true;
			content = contentHistory[historyIndex];
			setTimeout(() => {
				isUndoOperation = false;
			}, 50);
		}
	}

	function triggerAutoSave() {
		if (typeof window === 'undefined') return;
		if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
		autoSaveStatus = 'Menyimpan...';

		autoSaveTimeout = setTimeout(() => {
			const draft = {
				title,
				slug,
				category,
				readTime,
				description,
				tags,
				content,
				savedAt: Date.now()
			};
			try {
				localStorage.setItem(AUTOSAVE_STORAGE_KEY, JSON.stringify(draft));
				const time = new Date().toLocaleTimeString('id-ID', {
					hour: '2-digit',
					minute: '2-digit'
				});
				autoSaveStatus = `Tersimpan otomatis (${time})`;
			} catch {}
		}, 800);
	}

	function onContentInput() {
		pushHistory(content);
		triggerAutoSave();
	}

	function handleTextareaKeydown(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
			e.preventDefault();
			handleUndo();
		}
	}

	onMount(() => {
		contentHistory = [content];
		historyIndex = 0;

		try {
			const saved = localStorage.getItem(AUTOSAVE_STORAGE_KEY);
			if (saved) {
				const parsed = JSON.parse(saved);
				if (parsed && (parsed.title || parsed.content)) {
					title = parsed.title || '';
					slug = parsed.slug || '';
					category = parsed.category || 'Investasi';
					readTime = parsed.readTime || '5 min baca';
					description = parsed.description || '';
					tags = parsed.tags || 'Investasi, Keuangan, Mindset';
					content = parsed.content || '';
					contentHistory = [content];
					historyIndex = 0;
					autoSaveStatus = 'Draft sementara dimuat kembali';
				}
			}
		} catch {}
	});

	// Auto-generate slug when title changes
	let slugManuallyEdited = $state(false);
	function onTitleInput() {
		if (!slugManuallyEdited) {
			slug = title
				.toLowerCase()
				.trim()
				.replace(/[^\w\s-]/g, '')
				.replace(/[\s_-]+/g, '-')
				.replace(/^-+|-+$/g, '');
		}
		triggerAutoSave();
	}

	// Toolbar helper
	function insertFormatting(prefix: string, suffix: string = '') {
		const textarea = document.getElementById('markdown-editor') as HTMLTextAreaElement | null;
		if (!textarea) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const selectedText = content.substring(start, end);
		const replacement = `${prefix}${selectedText || 'teks'}${suffix}`;

		content = content.substring(0, start) + replacement + content.substring(end);
		pushHistory(content);
		triggerAutoSave();

		setTimeout(() => {
			textarea.focus();
			textarea.setSelectionRange(
				start + prefix.length,
				start + prefix.length + (selectedText || 'teks').length
			);
		}, 10);
	}

	// Full Markdown output with YAML Frontmatter
	const fullMarkdown = $derived.by(() => {
		const today = new Date().toISOString().split('T')[0];
		const tagList = tags
			.split(',')
			.map((t) => t.trim())
			.filter(Boolean);

		return [
			'---',
			`title: ${JSON.stringify(title || 'Judul Artikel')}`,
			`description: ${JSON.stringify(description || 'Ringkasan singkat artikel ini.')}`,
			`date: ${JSON.stringify(today)}`,
			`category: ${JSON.stringify(category)}`,
			`tags: ${JSON.stringify(tagList)}`,
			`readTime: ${JSON.stringify(readTime || '5 min baca')}`,
			'featured: false',
			'published: true',
			'author: "911"',
			'---',
			'',
			content.trim(),
			''
		].join('\n');
	});

	// Rendered HTML preview
	const renderedHtml = $derived.by(() => {
		try {
			return marked.parse(content || '') as string;
		} catch (e) {
			return '<p class="text-red-500">Gagal merender Markdown preview</p>';
		}
	});

	let editingSlug = $state<string | null>(null);
	let isLoadingPost = $state(false);
	let loadingPostSlug = $state<string | null>(null);
	let titleInputEl = $state<HTMLInputElement | null>(null);

	// Load existing post (Draft or Uploaded) into the editor
	async function loadPostForEditing(postSlug: string) {
		isLoadingPost = true;
		loadingPostSlug = postSlug;
		saveMessage = null;

		// Immediately start scrolling up so the user gets instant visual feedback
		if (typeof window !== 'undefined') {
			const target = document.getElementById('editor-studio-top') || document.documentElement;
			target.scrollIntoView({ behavior: 'smooth', block: 'start' });
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}

		try {
			const res = await fetch(`/api/get-post?slug=${encodeURIComponent(postSlug)}`);
			const resData = await res.json();
			if (resData.success && resData.post) {
				const p = resData.post;
				title = p.title;
				slug = p.slug;
				slugManuallyEdited = true;
				category = p.category;
				description = p.description;
				tags = p.tags;
				readTime = p.readTime;
				content = p.content;
				editingSlug = p.slug;

				// Reset history stack with loaded content
				contentHistory = [content];
				historyIndex = 0;

				saveMessage = {
					type: 'info',
					text: `Tulisan "${p.title}" berhasil dimuat ke editor! Anda dapat langsung mengedit.`
				};

				// Ensure smooth scroll to top and focus title field ready for editing
				if (typeof window !== 'undefined') {
					const target = document.getElementById('editor-studio-top') || document.documentElement;
					target.scrollIntoView({ behavior: 'smooth', block: 'start' });
					window.scrollTo({ top: 0, behavior: 'smooth' });
					setTimeout(() => {
						titleInputEl?.focus();
					}, 250);
				}
			} else {
				saveMessage = {
					type: 'error',
					text: resData.error || 'Gagal memuat tulisan.'
				};
			}
		} catch (err: any) {
			saveMessage = {
				type: 'error',
				text: 'Gagal mengambil data tulisan: ' + err.message
			};
		} finally {
			isLoadingPost = false;
			loadingPostSlug = null;
		}
	}

	function resetEditorToNew() {
		editingSlug = null;
		slugManuallyEdited = false;
		title = '';
		slug = '';
		description = '';
		tags = 'Investasi, Keuangan, Mindset';
		category = 'Investasi';
		readTime = '5 min baca';
		content = '';
		contentHistory = [''];
		historyIndex = 0;
		autoSaveStatus = '';
		saveMessage = {
			type: 'info',
			text: 'Form telah dikosongkan untuk memulai tulisan baru.'
		};
	}

	let deleteTarget = $state<{
		slug: string;
		title: string;
		isDraftFormOnly?: boolean;
	} | null>(null);
	let isDeletingPost = $state(false);

	function requestDeleteFile(targetSlug: string, postTitle: string) {
		deleteTarget = {
			slug: targetSlug,
			title: postTitle,
			isDraftFormOnly: false
		};
	}

	async function confirmDelete() {
		if (!deleteTarget) return;

		if (deleteTarget.isDraftFormOnly) {
			try {
				localStorage.removeItem(AUTOSAVE_STORAGE_KEY);
			} catch {}
			resetEditorToNew();
			saveMessage = {
				type: 'success',
				text: 'Isi form draft dan autosave sementara berhasil dibersihkan.'
			};
			deleteTarget = null;
			return;
		}

		isDeletingPost = true;
		saveMessage = null;

		const targetSlug = deleteTarget.slug;
		const postTitle = deleteTarget.title;

		try {
			const res = await fetch('/api/save-post', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ slug: targetSlug })
			});
			const resData = await res.json();
			if (resData.success) {
				saveMessage = {
					type: 'success',
					text: `Tulisan "${postTitle}" berhasil dihapus secara permanen.`
				};
				if (editingSlug === targetSlug) {
					resetEditorToNew();
				}
				deleteTarget = null;
				setTimeout(() => {
					window.location.reload();
				}, 600);
			} else {
				saveMessage = { type: 'error', text: resData.error || 'Gagal menghapus tulisan.' };
				isDeletingPost = false;
			}
		} catch (err: any) {
			saveMessage = { type: 'error', text: 'Koneksi gagal: ' + err.message };
			isDeletingPost = false;
		}
	}

	async function deletePostFile(targetSlug: string, postTitle: string) {
		requestDeleteFile(targetSlug, postTitle);
	}

	let isUpdatingStatus = $state(false);

	async function updatePostStatus(targetSlug: string, newStatus: 'upload' | 'draft' | 'arsip', postTitle: string) {
		isUpdatingStatus = true;
		saveMessage = null;
		try {
			const res = await fetch('/api/save-post', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ slug: targetSlug, status: newStatus })
			});
			const resData = await res.json();
			if (resData.success) {
				const label = newStatus === 'upload' ? 'Upload' : newStatus === 'arsip' ? 'Arsip' : 'Draft';
				saveMessage = {
					type: 'success',
					text: `Status tulisan "${postTitle}" berhasil diubah menjadi ${label}!`
				};
				const target = (data.posts || []).find((p: any) => p.slug === targetSlug);
				if (target) {
					target.metadata.status = newStatus;
					target.metadata.published = newStatus === 'upload';
					target.metadata.archived = newStatus === 'arsip';
				}
			} else {
				saveMessage = { type: 'error', text: resData.error || 'Gagal mengubah status.' };
			}
		} catch (err: any) {
			saveMessage = { type: 'error', text: 'Koneksi gagal: ' + err.message };
		} finally {
			isUpdatingStatus = false;
		}
	}

	// Save Post Action (Upload, Draft, or Arsip)
	async function savePost(targetStatus: 'upload' | 'draft' | 'arsip' = 'upload') {
		if (!title.trim()) {
			saveMessage = { type: 'error', text: 'Judul artikel wajib diisi terlebih dahulu!' };
			return;
		}

		isSaving = true;
		saveMessage = null;

		try {
			const res = await fetch('/api/save-post', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title,
					slug: slug || title,
					originalSlug: editingSlug || undefined,
					description,
					category,
					tags,
					readTime,
					content,
					status: targetStatus,
					published: targetStatus === 'upload',
					archived: targetStatus === 'arsip',
					author: 'Adam Alhasni'
				})
			});

			const resData = await res.json();

			if (resData.success) {
				const actionName =
					targetStatus === 'upload'
						? 'di-upload & dipublikasikan'
						: targetStatus === 'arsip'
						? 'disimpan ke Arsip'
						: 'disimpan sebagai Draft';
				editingSlug = resData.slug || slug;
				saveMessage = {
					type: 'success',
					text: `Artikel "${title}" berhasil ${actionName}!`
				};
				// Autosave is temporary until author uploads, drafts, or deletes
				try {
					localStorage.removeItem(AUTOSAVE_STORAGE_KEY);
				} catch {}
				autoSaveStatus = `Telah ${actionName}`;
				setTimeout(() => {
					window.location.reload();
				}, 700);
			} else {
				saveMessage = { type: 'error', text: resData.error || 'Gagal menyimpan tulisan.' };
			}
		} catch (err: any) {
			saveMessage = { type: 'error', text: 'Koneksi gagal: ' + err.message };
		} finally {
			isSaving = false;
		}
	}

	// Delete current draft and clear temporary autosave
	function handleDeleteDraft() {
		if (editingSlug) {
			requestDeleteFile(editingSlug, title || editingSlug);
			return;
		}

		deleteTarget = {
			slug: '',
			title: title || 'Draft Form Baru',
			isDraftFormOnly: true
		};
	}

	function handleWindowKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			if (openedFolder) {
				openedFolder = null;
			} else if (deleteTarget && !isDeletingPost) {
				deleteTarget = null;
			} else if (viewingReferrerPost) {
				viewingReferrerPost = null;
			} else if (saveMessage) {
				saveMessage = null;
			}
		}
	}
</script>

<svelte:window onkeydown={handleWindowKeydown} />

<svelte:head>
	<title>{data.isAuthenticated ? 'Studio Penulis (Admin)' : 'Login'} — 911</title>
</svelte:head>

{#if !data.isAuthenticated}
	<!-- LOGIN SCREEN (Liquid Glass Sky Blue & Hot Pink) -->
	<div class="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 text-[#061a2e] dark:text-white">
		<div class="w-full max-w-md">
			<!-- Login Card (Liquid Glass) -->
			<div class="glass-panel rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden transition-all text-[#061a2e] dark:text-white border border-sky-200/60 dark:border-white/20">
				<!-- Accent top gradient line -->
				<div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-white via-[#D83995] to-[#f29185]"></div>

				<!-- Logo / Monogram -->
				<div class="flex flex-col items-center justify-center gap-2 mb-7">
					<div class="w-14 h-14 rounded-full bg-[#0593C6] dark:bg-white/20 border border-[#0593C6]/30 dark:border-white/30 text-white flex items-center justify-center font-black text-2xl shadow-lg backdrop-blur-md">
						<span>A</span>
						<span class="w-2 h-2 rounded-full bg-[#D83995] ml-0.5 -mt-3"></span>
					</div>
					<span class="font-black text-2xl tracking-tight text-[#061a2e] dark:text-white">
						911
					</span>
				</div>

				<!-- Error alert if login fails -->
				{#if form?.error}
					<div class="mb-6 p-3.5 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 border border-rose-400/40 text-rose-700 dark:text-rose-100 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-200">
						<AlertCircle class="w-4 h-4 text-rose-500 dark:text-rose-300 shrink-0" />
						<span>{form.error}</span>
					</div>
				{/if}

				<!-- Login Form -->
				<form method="POST" action="?/login" class="space-y-5">
					<div>
						<label for="admin-user" class="block text-xs font-bold text-[#061a2e] dark:text-white uppercase tracking-wider mb-2">
							Username
						</label>
						<div class="relative">
							<div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#0593C6] dark:text-white/60">
								<User class="w-4 h-4" />
							</div>
							<input
								id="admin-user"
								name="username"
								type="text"
								value={form?.username || ''}
								required
								autocomplete="username"
								placeholder="Username admin"
								class="w-full pl-10 pr-4 py-3 rounded-xl border border-sky-200/80 dark:border-white/25 bg-white/80 dark:bg-black/30 text-[#061a2e] dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#0593C6] dark:focus:ring-white/50 focus:border-[#0593C6] dark:focus:border-white transition backdrop-blur-md"
							/>
						</div>
					</div>

					<div>
						<label for="admin-pass" class="block text-xs font-bold text-[#061a2e] dark:text-white uppercase tracking-wider mb-2">
							Password
						</label>
						<div class="relative">
							<div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#0593C6] dark:text-white/60">
								<Lock class="w-4 h-4" />
							</div>
							<input
								id="admin-pass"
								name="password"
								type={showPassword ? 'text' : 'password'}
								required
								autocomplete="current-password"
								placeholder="••••••••••••"
								class="w-full pl-10 pr-11 py-3 rounded-xl border border-sky-200/80 dark:border-white/25 bg-white/80 dark:bg-black/30 text-[#061a2e] dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#0593C6] dark:focus:ring-white/50 focus:border-[#0593C6] dark:focus:border-white transition backdrop-blur-md"
							/>
							<button
								type="button"
								onclick={() => showPassword = !showPassword}
								class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#516f8e] dark:text-white hover:text-[#0593C6] dark:hover:text-[#D83995] transition cursor-pointer"
								title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
							>
								{#if showPassword}
									<EyeOff class="w-4 h-4" />
								{:else}
									<Eye class="w-4 h-4" />
								{/if}
							</button>
						</div>
					</div>

					<button
						type="submit"
						class="w-full py-3.5 px-4 rounded-xl bg-[#0593C6] hover:bg-[#047ea8] text-white font-black text-sm hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-[#0593C6]/25 dark:shadow-[#0593C6]/40 cursor-pointer flex items-center justify-center gap-2 mt-4"
					>
						<span class="text-white font-black tracking-wide">Login</span>
					</button>
				</form>
			</div>
		</div>
	</div>
{:else}
	<!-- AUTHENTICATED WRITING STUDIO (Liquid Glass Aesthetic) -->
	<div id="editor-studio-top" class="py-6 sm:py-10 text-[#061a2e] dark:text-white transition-colors">
		<div class="max-w-7xl mx-auto px-4 sm:px-6">
			<!-- Top Bar with Logout -->
			<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-sky-200/50 dark:border-white/20">
				<div>
					<div class="flex items-center gap-2.5 flex-wrap">
						<h1 class="text-2xl sm:text-3xl font-black text-[#061a2e] dark:text-white tracking-tight drop-shadow-xs">
							Draft Penulisan
						</h1>
						{#if editingSlug}
							<span class="text-xs px-2.5 py-1 rounded-full bg-sky-500/15 text-[#0593C6] dark:text-sky-300 font-bold border border-[#0593C6]/30 flex items-center gap-1.5">
								<span class="w-1.5 h-1.5 rounded-full bg-[#0593C6] animate-pulse"></span>
								<span>Mengedit: <strong class="font-mono">{editingSlug}.md</strong></span>
								<button
									type="button"
									onclick={resetEditorToNew}
									class="ml-1 text-slate-400 hover:text-rose-500 transition font-black cursor-pointer"
									title="Batal edit dan buat tulisan baru"
								>✕</button>
							</span>
						{/if}
					</div>
					{#if autoSaveStatus}
						<span class="text-xs text-[#0593C6] dark:text-sky-300 font-medium inline-flex items-center gap-1.5 mt-1.5">
							<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
							{autoSaveStatus}
						</span>
					{/if}
				</div>

				<!-- Action Buttons Group (Upload, Draft, Arsip, Hapus) -->
				<div class="flex flex-wrap items-center gap-2 sm:gap-3">
					<button
						type="button"
						onclick={() => savePost('upload')}
						disabled={isSaving}
						class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0593C6] text-white hover:bg-[#047ea8] hover:text-white dark:bg-white dark:text-[#0593C6] dark:hover:bg-[#047ea8] dark:hover:text-white text-xs font-bold active:scale-[0.99] transition cursor-pointer shadow-lg shadow-[#0593C6]/25 disabled:opacity-50"
						title="Upload dan publikasikan tulisan ini"
					>
						<Upload class="w-4 h-4 text-current" />
						<span class="text-current">{isSaving ? 'Menyimpan...' : 'Upload'}</span>
					</button>

					<button
						type="button"
						onclick={() => savePost('draft')}
						disabled={isSaving}
						class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl glass-pill text-[#0593C6] dark:text-sky-200 hover:bg-[#0593C6]/15 hover:text-[#0593C6] dark:hover:bg-white/15 dark:hover:text-white border border-[#0593C6]/30 dark:border-white/20 text-xs font-bold transition cursor-pointer"
						title="Simpan sebagai Draft di project"
					>
						<Bookmark class="w-4 h-4 text-current" />
						<span class="text-current">Draft</span>
					</button>

					<button
						type="button"
						onclick={() => savePost('arsip')}
						disabled={isSaving}
						class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl glass-pill text-purple-600 dark:text-purple-300 hover:bg-purple-500/15 hover:text-purple-600 dark:hover:bg-purple-500/20 dark:hover:text-purple-200 border border-purple-400/30 text-xs font-bold transition cursor-pointer"
						title="Simpan ke Arsip (tersembunyi dari publik)"
					>
						<Archive class="w-4 h-4 text-current" />
						<span class="text-current">Arsip</span>
					</button>

					<button
						type="button"
						onclick={handleDeleteDraft}
						class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl glass-pill text-rose-600 dark:text-rose-300 hover:text-white hover:bg-rose-500/80 border border-rose-300 dark:border-rose-400/30 text-xs font-bold transition cursor-pointer"
						title="Hapus draft dan bersihkan editor"
					>
						<Trash2 class="w-4 h-4 text-rose-500 dark:text-rose-300" />
						<span>Hapus</span>
					</button>
				</div>
			</div>

			<!-- Status Message Toast -->
			{#if saveMessage}
				<div class="mb-6 p-4 rounded-2xl flex items-start gap-3 text-sm animate-in fade-in duration-200 {saveMessage.type === 'success'
					? 'bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-400/40 text-emerald-800 dark:text-emerald-100'
					: saveMessage.type === 'info'
					? 'bg-sky-500/10 dark:bg-sky-500/20 border border-sky-400/40 text-sky-800 dark:text-sky-100'
					: 'bg-rose-500/10 dark:bg-rose-500/20 border border-rose-400/40 text-rose-800 dark:text-rose-100'} glass-panel">
					{#if saveMessage.type === 'success'}
						<Check class="w-5 h-5 text-emerald-500 dark:text-emerald-300 shrink-0 mt-0.5" />
					{:else}
						<AlertCircle class="w-5 h-5 text-current shrink-0 mt-0.5" />
					{/if}
					<div class="flex-1 font-medium">{saveMessage.text}</div>
					<button onclick={() => saveMessage = null} class="text-xs font-bold opacity-60 hover:opacity-100 p-1">✕</button>
				</div>
			{/if}

			<!-- View Switcher on Small Screens -->
			<div class="flex items-center gap-2 mb-4 lg:hidden glass-pill p-1 rounded-2xl">
				<button
					onclick={() => activeTab = 'editor'}
					class="flex-1 py-2 text-xs font-bold rounded-xl transition {activeTab === 'editor' ? 'bg-[#0593C6] text-white dark:bg-white dark:text-[#0593C6] shadow-sm' : 'text-[#334e6b] dark:text-white/80 hover:text-[#0593C6] dark:hover:text-white'}"
				>
					Editor Ketik
				</button>
				<button
					onclick={() => activeTab = 'preview'}
					class="flex-1 py-2 text-xs font-bold rounded-xl transition {activeTab === 'preview' ? 'bg-[#0593C6] text-white dark:bg-white dark:text-[#0593C6] shadow-sm' : 'text-[#334e6b] dark:text-white/80 hover:text-[#0593C6] dark:hover:text-white'}"
				>
					Live Preview
				</button>
			</div>

			<!-- Main Two-Column Layout with Independent Split-Pane Scrolling -->
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
				<!-- LEFT COLUMN: Editor Form (Independent Scroll) -->
				<div class="glass-panel rounded-3xl text-[#061a2e] dark:text-white border border-sky-200/60 dark:border-white/20 h-auto lg:h-[calc(100vh-7rem)] lg:sticky lg:top-20 flex flex-col overflow-hidden shadow-xl {activeTab === 'preview' ? 'hidden lg:flex' : 'flex'}">
					<!-- Fixed Card Header (Non-scrolling, never bleeds through) -->
					<div class="flex items-center justify-between px-6 py-4 border-b border-sky-200/50 dark:border-white/15 bg-white/80 dark:bg-[#071626]/90 backdrop-blur-xl shrink-0">
						<h2 class="font-black text-sm sm:text-base text-[#061a2e] dark:text-white flex items-center gap-2">
							<FileText class="w-4 h-4 text-[#D83995]" />
							Metadata & Tulisan
						</h2>
						<button type="button" onclick={handleDeleteDraft} class="text-xs text-[#516f8e] dark:text-white/60 hover:text-rose-500 dark:hover:text-rose-300 transition cursor-pointer font-semibold">
							Kosongkan Form
						</button>
					</div>

					<!-- Scrollable Form Body -->
					<div class="flex-1 overflow-y-auto p-6 sm:p-7 space-y-5 custom-scrollbar overscroll-contain">

					<!-- Judul Input -->
					<div>
						<label for="post-title" class="block text-xs font-bold text-[#061a2e] dark:text-white uppercase tracking-wider mb-1.5">
							Judul Artikel *
						</label>
						<input
							id="post-title"
							bind:this={titleInputEl}
							type="text"
							bind:value={title}
							oninput={onTitleInput}
							placeholder="Contoh: Mengapa Uang Tunai Tetap Berharga di Saat Suku Bunga Tinggi"
							class="w-full h-11 px-4 rounded-xl border border-sky-200/80 dark:border-white/20 bg-white/80 dark:bg-black/30 text-[#061a2e] dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#0593C6] dark:focus:ring-white/40 focus:border-[#0593C6] dark:focus:border-white text-sm placeholder:text-slate-400 dark:placeholder:text-white/45 backdrop-blur-md transition"
						/>
					</div>

					<!-- Category Input (Full Width matching all input boxes) -->
					<div>
						<label for="post-category" class="block text-xs font-bold text-[#061a2e] dark:text-white uppercase tracking-wider mb-1.5">
							Kategori Artikel *
						</label>
						<select
							id="post-category"
							bind:value={category}
							onchange={triggerAutoSave}
							class="w-full h-11 px-4 rounded-xl border border-sky-200/80 dark:border-white/20 bg-white/80 dark:bg-black/40 text-[#061a2e] dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0593C6] dark:focus:ring-white/40 focus:border-[#0593C6] dark:focus:border-white backdrop-blur-md transition cursor-pointer"
						>
							<option value="Investasi" class="bg-white dark:bg-[#051a2e] text-[#061a2e] dark:text-white">Investasi</option>
							<option value="Mindset Keuangan" class="bg-white dark:bg-[#051a2e] text-[#061a2e] dark:text-white">Mindset Keuangan</option>
							<option value="Opini Dunia" class="bg-white dark:bg-[#051a2e] text-[#061a2e] dark:text-white">Opini Dunia</option>
							<option value="Geopolitik" class="bg-white dark:bg-[#051a2e] text-[#061a2e] dark:text-white">Geopolitik</option>
							<option value="Refleksi Hidup" class="bg-white dark:bg-[#051a2e] text-[#061a2e] dark:text-white">Refleksi Hidup</option>
							<option value="Analisis Pasar" class="bg-white dark:bg-[#051a2e] text-[#061a2e] dark:text-white">Analisis Pasar</option>
						</select>
					</div>

					<!-- Slug URL (Full Width) -->
					<div>
						<label for="post-slug" class="block text-xs font-bold text-[#061a2e] dark:text-white uppercase tracking-wider mb-1.5">
							Slug URL
						</label>
						<input
							id="post-slug"
							type="text"
							bind:value={slug}
							oninput={() => { slugManuallyEdited = true; triggerAutoSave(); }}
							placeholder="mengapa-uang-tunai-berharga"
							class="w-full h-11 px-4 rounded-xl border border-sky-200/80 dark:border-white/20 bg-white/80 dark:bg-black/30 text-[#061a2e] dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#0593C6] dark:focus:ring-white/40 focus:border-[#0593C6] dark:focus:border-white placeholder:text-slate-400 dark:placeholder:text-white/45 backdrop-blur-md transition"
						/>
					</div>

					<!-- Description / Excerpt -->
					<div>
						<label for="post-desc" class="block text-xs font-bold text-[#061a2e] dark:text-white uppercase tracking-wider mb-1.5">
							Ringkasan Singkat (Lead / Excerpt)
						</label>
						<textarea
							id="post-desc"
							bind:value={description}
							rows="2"
							placeholder="Satu atau dua kalimat yang merangkum pesan utama tulisan ini..."
							class="w-full px-3.5 py-2.5 rounded-xl border border-sky-200/80 dark:border-white/20 bg-white/80 dark:bg-black/30 text-[#061a2e] dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#0593C6] dark:focus:ring-white/40 focus:border-[#0593C6] dark:focus:border-white leading-relaxed placeholder:text-slate-400 dark:placeholder:text-white/45 backdrop-blur-md transition"
						></textarea>
					</div>

					<!-- Tags & ReadTime Row -->
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label for="post-tags" class="block text-xs font-bold text-[#061a2e] dark:text-white uppercase tracking-wider mb-1.5">
								Tags (Pisahkan koma)
							</label>
							<input
								id="post-tags"
								type="text"
								bind:value={tags}
								placeholder="Investasi, Cashflow, Saham"
								class="w-full h-11 px-3.5 rounded-xl border border-sky-200/80 dark:border-white/20 bg-white/80 dark:bg-black/30 text-[#061a2e] dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#0593C6] dark:focus:ring-white/40 focus:border-[#0593C6] dark:focus:border-white placeholder:text-slate-400 dark:placeholder:text-white/45 backdrop-blur-md transition"
							/>
						</div>
						<div>
							<label for="post-readtime" class="block text-xs font-bold text-[#061a2e] dark:text-white uppercase tracking-wider mb-1.5">
								Estimasi Waktu Baca
							</label>
							<input
								id="post-readtime"
								type="text"
								bind:value={readTime}
								placeholder="5 min baca"
								class="w-full h-11 px-3.5 rounded-xl border border-sky-200/80 dark:border-white/20 bg-white/80 dark:bg-black/30 text-[#061a2e] dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#0593C6] dark:focus:ring-white/40 focus:border-[#0593C6] dark:focus:border-white placeholder:text-slate-400 dark:placeholder:text-white/45 backdrop-blur-md transition"
							/>
						</div>
					</div>

					<!-- Formatting Toolbar -->
					<div>
						<div class="flex items-center justify-between mb-2">
							<label for="markdown-editor" class="text-xs font-bold text-[#061a2e] dark:text-white uppercase tracking-wider">
								Isi Konten (Markdown)
							</label>
							<div class="text-[11px] text-[#516f8e] dark:text-white/60">
								{content.length} karakter • {content.split(/\s+/).filter(Boolean).length} kata
							</div>
						</div>

						<div class="flex flex-wrap items-center gap-1 p-2 bg-sky-50/90 dark:bg-black/35 border border-sky-200/80 dark:border-white/20 rounded-t-2xl text-[#061a2e] dark:text-white backdrop-blur-md">
							<!-- Undo Button -->
							<button
								type="button"
								onclick={handleUndo}
								disabled={historyIndex <= 0}
								class="p-1.5 hover:bg-sky-500/15 dark:hover:bg-white/25 rounded-lg text-[#334e6b] dark:text-white/80 hover:text-[#0593C6] dark:hover:text-white transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 mr-1"
								title="Undo (Kembalikan ketikan) [Ctrl+Z]"
							>
								<Undo2 class="w-4 h-4 text-[#0593C6] dark:text-sky-300" />
								<span class="text-xs font-bold">Undo</span>
							</button>
							<div class="w-px h-4 bg-sky-300/60 dark:bg-white/20 mx-1"></div>

							<button type="button" onclick={() => insertFormatting('## ')} class="p-1.5 hover:bg-sky-500/15 dark:hover:bg-white/25 rounded-lg text-[#334e6b] dark:text-white/80 hover:text-[#0593C6] dark:hover:text-white transition cursor-pointer" title="Heading 2">
								<Heading2 class="w-4 h-4" />
							</button>
							<button type="button" onclick={() => insertFormatting('### ')} class="p-1.5 hover:bg-sky-500/15 dark:hover:bg-white/25 rounded-lg text-[#334e6b] dark:text-white/80 hover:text-[#0593C6] dark:hover:text-white transition cursor-pointer" title="Heading 3">
								<Heading3 class="w-4 h-4" />
							</button>
							<button type="button" onclick={() => insertFormatting('**', '**')} class="p-1.5 hover:bg-sky-500/15 dark:hover:bg-white/25 rounded-lg text-[#334e6b] dark:text-white/80 hover:text-[#0593C6] dark:hover:text-white transition cursor-pointer" title="Tebal (Bold)">
								<Bold class="w-4 h-4" />
							</button>
							<button type="button" onclick={() => insertFormatting('*', '*')} class="p-1.5 hover:bg-sky-500/15 dark:hover:bg-white/25 rounded-lg text-[#334e6b] dark:text-white/80 hover:text-[#0593C6] dark:hover:text-white transition cursor-pointer" title="Miring (Italic)">
								<Italic class="w-4 h-4" />
							</button>
							<button type="button" onclick={() => insertFormatting('> ')} class="p-1.5 hover:bg-sky-500/15 dark:hover:bg-white/25 rounded-lg text-[#D83995] dark:text-[#f29185] hover:text-[#D83995] dark:hover:text-white transition cursor-pointer" title="Kutipan (Blockquote)">
								<Quote class="w-4 h-4" />
							</button>
							<button type="button" onclick={() => insertFormatting('* ')} class="p-1.5 hover:bg-sky-500/15 dark:hover:bg-white/25 rounded-lg text-[#334e6b] dark:text-white/80 hover:text-[#0593C6] dark:hover:text-white transition cursor-pointer" title="Daftar Poin">
								<List class="w-4 h-4" />
							</button>
							<button type="button" onclick={() => insertFormatting('```\n', '\n```')} class="p-1.5 hover:bg-sky-500/15 dark:hover:bg-white/25 rounded-lg text-[#334e6b] dark:text-white/80 hover:text-[#0593C6] dark:hover:text-white transition cursor-pointer" title="Code Block">
								<Code class="w-4 h-4" />
							</button>
							<button type="button" onclick={() => insertFormatting('\n| Aset | Alokasi | Alasan |\n|---|---|---|\n| Kas | 40% | Ketahanan likuiditas |\n')} class="p-1.5 hover:bg-sky-500/15 dark:hover:bg-white/25 rounded-lg text-[#334e6b] dark:text-white/80 hover:text-[#0593C6] dark:hover:text-white transition cursor-pointer" title="Tabel Keuangan">
								<Table class="w-4 h-4" />
							</button>
						</div>

						<textarea
							id="markdown-editor"
							bind:value={content}
							oninput={onContentInput}
							onkeydown={handleTextareaKeydown}
							rows="16"
							placeholder="Mulai ketik cerita atau analisis Anda di sini..."
							class="w-full p-4 rounded-b-2xl border border-t-0 border-sky-200/80 dark:border-white/20 bg-white/60 dark:bg-black/35 text-[#1b324b] dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0593C6] dark:focus:ring-white/40 focus:border-[#0593C6] dark:focus:border-white leading-relaxed resize-y placeholder:text-slate-400 dark:placeholder:text-white/45 backdrop-blur-md"
						></textarea>
					</div>
				</div>
			</div>

				<!-- RIGHT COLUMN: Live Preview (Independent Scroll) -->
				<div class="glass-panel rounded-3xl text-[#061a2e] dark:text-white border border-sky-200/60 dark:border-white/20 h-auto lg:h-[calc(100vh-7rem)] lg:sticky lg:top-20 flex flex-col overflow-hidden shadow-xl {activeTab === 'editor' ? 'hidden lg:flex' : 'flex'}">
					<!-- Fixed Card Header (Non-scrolling, never bleeds through) -->
					<div class="flex items-center justify-between px-6 py-4 border-b border-sky-200/50 dark:border-white/15 bg-white/80 dark:bg-[#071626]/90 backdrop-blur-xl shrink-0">
						<div class="flex items-center gap-2">
							<Eye class="w-4 h-4 text-[#D83995]" />
							<span class="font-black text-sm text-[#061a2e] dark:text-white">Live Preview Pembaca</span>
						</div>
						<span class="text-xs px-3 py-1 rounded-full glass-pill font-semibold text-[#0593C6] dark:text-white">
							{category}
						</span>
					</div>

					<!-- Scrollable Rendered Markdown Body -->
					<div class="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar overscroll-contain">

					<!-- Preview Title -->
					<h1 class="text-2xl sm:text-3xl font-black text-[#061a2e] dark:text-white tracking-tight leading-tight mb-3 drop-shadow-xs">
						{title || 'Judul Artikel Akan Muncul di Sini'}
					</h1>

					<!-- Preview Description -->
					{#if description}
						<p class="text-[#2e4a68] dark:text-white/80 text-sm leading-relaxed mb-4 font-normal italic">
							{description}
						</p>
					{/if}

					<!-- Preview Metadata Bar -->
					<div class="flex items-center gap-4 text-xs text-[#516f8e] dark:text-white/65 pb-5 mb-5 border-b border-sky-200/50 dark:border-white/15">
						<span class="font-bold text-[#061a2e] dark:text-white">911</span>
						<span>•</span>
						<div class="flex items-center gap-1.5">
							<Clock class="w-3.5 h-3.5 text-[#D83995]" />
							<span>{readTime}</span>
						</div>
						<span>•</span>
						<div class="flex items-center gap-1.5">
							<Calendar class="w-3.5 h-3.5 text-[#0593C6] dark:text-white/70" />
							<span>{new Date().toISOString().split('T')[0]}</span>
						</div>
					</div>

					<!-- Rendered Markdown Body -->
					<div class="preview-body prose prose-slate dark:prose-invert max-w-none text-sm text-[#1e344d] dark:text-white/90 leading-relaxed
						prose-headings:text-[#061a2e] dark:prose-headings:text-white prose-headings:font-black
						prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3 prose-h2:border-b prose-h2:border-sky-200/50 dark:prose-h2:border-white/15 prose-h2:pb-1.5
						prose-h3:text-lg prose-h3:mt-5 prose-h3:mb-2 prose-h3:text-[#0593C6] dark:prose-h3:text-white/90
						prose-blockquote:border-l-4 prose-blockquote:border-[#D83995] prose-blockquote:bg-[#D83995]/8 dark:prose-blockquote:bg-[#D83995]/15 prose-blockquote:p-3.5 prose-blockquote:rounded-r-xl prose-blockquote:text-[#183049] dark:prose-blockquote:text-white/95 prose-blockquote:italic
						prose-code:text-[#D83995] prose-code:bg-sky-500/10 dark:prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-mono
						prose-table:border-collapse prose-th:bg-sky-500/10 dark:prose-th:bg-white/10 prose-th:text-[#061a2e] dark:prose-th:text-white prose-th:p-2.5 prose-td:p-2.5 prose-td:border-b prose-td:border-sky-200/50 dark:prose-td:border-white/10 prose-td:text-[#1e344d] dark:prose-td:text-white/85">
						{@html renderedHtml}
					</div>
				</div>
			</div>
		</div>

			<!-- Existing Posts Section in Admin -->
			<div class="mt-16 pt-10 border-t border-sky-200/50 dark:border-white/20">
				<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
					<div class="flex items-center gap-2">
						<Layers class="w-5 h-5 text-[#D83995]" />
						<h3 class="text-xl font-black text-[#061a2e] dark:text-white tracking-tight">Dashboard</h3>
					</div>
					<div>
						<a href="/artikel" class="text-xs font-semibold text-[#0593C6] dark:text-white/90 hover:underline flex items-center gap-1">
							<span>Lihat halaman pembaca</span>
							<span>→</span>
						</a>
					</div>
				</div>

				<!-- Stats Overview Cards (Compact & Centered: Upload, Draft, Arsip, Views) -->
				<div class="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
					<div class="glass-panel p-3.5 sm:p-4 rounded-2xl border border-sky-200/60 dark:border-white/20 text-center flex flex-col items-center justify-center shadow-sm">
						<div class="text-[11px] sm:text-xs text-[#516f8e] dark:text-white/70 font-semibold mb-1 flex items-center justify-center gap-1.5">
							<Upload class="w-3.5 h-3.5 text-emerald-500" />
							<span>Total Artikel (Upload)</span>
						</div>
						<div class="text-2xl font-black text-[#061a2e] dark:text-white">{uploadCount}</div>
					</div>

					<div class="glass-panel p-3.5 sm:p-4 rounded-2xl border border-sky-200/60 dark:border-white/20 text-center flex flex-col items-center justify-center shadow-sm">
						<div class="text-[11px] sm:text-xs text-[#516f8e] dark:text-white/70 font-semibold mb-1 flex items-center justify-center gap-1.5">
							<Bookmark class="w-3.5 h-3.5 text-amber-500" />
							<span>Total Artikel (Draft)</span>
						</div>
						<div class="text-2xl font-black text-[#061a2e] dark:text-white">{draftCount}</div>
					</div>

					<div class="glass-panel p-3.5 sm:p-4 rounded-2xl border border-sky-200/60 dark:border-white/20 text-center flex flex-col items-center justify-center shadow-sm">
						<div class="text-[11px] sm:text-xs text-[#516f8e] dark:text-white/70 font-semibold mb-1 flex items-center justify-center gap-1.5">
							<Archive class="w-3.5 h-3.5 text-purple-500" />
							<span>Total Artikel (Arsip)</span>
						</div>
						<div class="text-2xl font-black text-[#061a2e] dark:text-white">{arsipCount}</div>
					</div>

					<div class="glass-panel p-3.5 sm:p-4 rounded-2xl border border-sky-200/60 dark:border-white/20 text-center flex flex-col items-center justify-center shadow-sm">
						<div class="text-[11px] sm:text-xs text-[#516f8e] dark:text-white/70 font-semibold mb-1 flex items-center justify-center gap-1.5">
							<Eye class="w-3.5 h-3.5 text-[#0593C6]" />
							<span>Total Pembaca Tulisan</span>
						</div>
						<div class="text-2xl font-black text-[#0593C6] dark:text-sky-300">{totalViews}</div>
					</div>
				</div>

				<!-- Referral Traffic Tracking Overview (Aligned & Centered) -->
				<div class="max-w-4xl mx-auto mb-8 p-4 sm:p-5 rounded-2xl glass-panel border border-sky-200/60 dark:border-white/20">
					<div class="flex items-center gap-2 mb-3">
						<Share2 class="w-4 h-4 text-[#0593C6] dark:text-sky-300" />
						<h3 class="text-xs sm:text-sm font-black text-[#061a2e] dark:text-white">Sumber Trafik Pembaca (Referral Tracking)</h3>
					</div>

					<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 text-xs">
						<!-- WhatsApp -->
						<div class="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
							<div class="flex items-center gap-1.5">
								<span class="w-2 h-2 rounded-full bg-[#25D366]"></span>
								<span class="font-bold text-emerald-900 dark:text-emerald-200 text-[11px]">WhatsApp</span>
							</div>
							<span class="font-black text-emerald-700 dark:text-emerald-300">{(data.totalReferrers?.whatsapp) || 0}</span>
						</div>

						<!-- Instagram -->
						<div class="p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-between">
							<div class="flex items-center gap-1.5">
								<span class="w-2 h-2 rounded-full bg-[#E1306C]"></span>
								<span class="font-bold text-pink-900 dark:text-pink-200 text-[11px]">Instagram</span>
							</div>
							<span class="font-black text-pink-700 dark:text-pink-300">{(data.totalReferrers?.instagram) || 0}</span>
						</div>

						<!-- TikTok -->
						<div class="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between">
							<div class="flex items-center gap-1.5">
								<span class="w-2 h-2 rounded-full bg-[#00f2fe]"></span>
								<span class="font-bold text-cyan-900 dark:text-cyan-200 text-[11px]">TikTok</span>
							</div>
							<span class="font-black text-cyan-700 dark:text-cyan-300">{(data.totalReferrers?.tiktok) || 0}</span>
						</div>

						<!-- X / Twitter -->
						<div class="p-2.5 rounded-xl bg-sky-500/10 border border-sky-400/30 flex items-center justify-between">
							<div class="flex items-center gap-1.5">
								<span class="w-2 h-2 rounded-full bg-[#0593C6]"></span>
								<span class="font-bold text-[#0593C6] dark:text-sky-200 text-[11px]">X (Twitter)</span>
							</div>
							<span class="font-black text-[#0593C6] dark:text-sky-300">{(data.totalReferrers?.twitter) || 0}</span>
						</div>

						<!-- Telegram -->
						<div class="p-2.5 rounded-xl bg-blue-500/10 border border-blue-400/30 flex items-center justify-between">
							<div class="flex items-center gap-1.5">
								<span class="w-2 h-2 rounded-full bg-[#229ED9]"></span>
								<span class="font-bold text-blue-900 dark:text-blue-200 text-[11px]">Telegram</span>
							</div>
							<span class="font-black text-blue-700 dark:text-blue-300">{(data.totalReferrers?.telegram) || 0}</span>
						</div>

						<!-- Langsung & Salin Tautan -->
						<div class="p-2.5 rounded-xl bg-slate-500/10 border border-slate-400/30 flex items-center justify-between">
							<div class="flex items-center gap-1.5">
								<span class="w-2 h-2 rounded-full bg-slate-400"></span>
								<span class="font-bold text-slate-800 dark:text-slate-200 text-[11px]">Direct / Lain</span>
							</div>
							<span class="font-black text-slate-700 dark:text-slate-300">
								{((data.totalReferrers?.direct || 0) + (data.totalReferrers?.salin_tautan || 0) + (data.totalReferrers?.mesin_pencari || 0))}
							</span>
						</div>
					</div>
				</div>

				<!-- Liquid Glass 3D Article Folders Showcase -->
				<div class="mb-10 p-5 sm:p-7 rounded-3xl glass-panel border border-sky-200/50 dark:border-white/15 shadow-xl">
					<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-4 border-b border-sky-100/60 dark:border-white/10">
						<div class="flex items-center gap-2">
							<FolderOpen class="w-4 h-4 text-[#D83995]" />
							<h4 class="text-sm font-black text-[#061a2e] dark:text-white uppercase tracking-wider">
								Katalog Arsip Folder Berkas
							</h4>
						</div>
						<span class="text-[11px] text-[#516f8e] dark:text-white/60 font-medium">
							✨ Hover untuk mengintip berkas • Klik untuk buka 1 folder
						</span>
					</div>

					<!-- Headroom (pt-12) to ensure fanning cards have ample space without hitting the title -->
					<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-12 pb-2">
						<ArticleFolder
							posts={uploadPosts}
							label="Terbit (Upload)"
							variant="emerald"
							isActive={dashboardFilter === 'upload'}
							isPinned={openedFolder === 'upload'}
							onTogglePinned={() => handleToggleFolder('upload')}
							onSelectFolder={() => dashboardFilter = 'upload'}
							onEditPost={(slug) => loadPostForEditing(slug)}
						/>

						<ArticleFolder
							posts={draftPosts}
							label="Draft Berkas"
							variant="amber"
							isActive={dashboardFilter === 'draft'}
							isPinned={openedFolder === 'draft'}
							onTogglePinned={() => handleToggleFolder('draft')}
							onSelectFolder={() => dashboardFilter = 'draft'}
							onEditPost={(slug) => loadPostForEditing(slug)}
						/>

						<ArticleFolder
							posts={arsipPosts}
							label="Arsip Tulisan"
							variant="purple"
							isActive={dashboardFilter === 'arsip'}
							isPinned={openedFolder === 'arsip'}
							onTogglePinned={() => handleToggleFolder('arsip')}
							onSelectFolder={() => dashboardFilter = 'arsip'}
							onEditPost={(slug) => loadPostForEditing(slug)}
						/>

						<ArticleFolder
							posts={postsWithViews}
							label="Semua Berkas"
							variant="cyan"
							isActive={dashboardFilter === 'semua'}
							isPinned={openedFolder === 'semua'}
							onTogglePinned={() => handleToggleFolder('semua')}
							onSelectFolder={() => dashboardFilter = 'semua'}
							onEditPost={(slug) => loadPostForEditing(slug)}
						/>
					</div>
				</div>

				<!-- Dashboard Filter Tabs (Centered) -->
				<div class="flex items-center justify-center gap-2 mb-6 overflow-x-auto pb-1 flex-wrap">
					<button
						type="button"
						onclick={() => dashboardFilter = 'semua'}
						class="px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 {dashboardFilter === 'semua' ? 'bg-[#0593C6] text-white shadow-sm' : 'glass-pill text-[#516f8e] dark:text-white/70 hover:text-[#0593C6] dark:hover:text-white'}"
					>
						<span>Semua</span>
						<span class="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 dark:bg-white/20">{data.posts?.length || 0}</span>
					</button>

					<button
						type="button"
						onclick={() => dashboardFilter = 'upload'}
						class="px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 {dashboardFilter === 'upload' ? 'bg-emerald-600 text-white shadow-sm' : 'glass-pill text-[#516f8e] dark:text-white/70 hover:text-emerald-500'}"
					>
						<span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
						<span>Upload</span>
						<span class="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 dark:bg-white/20">{uploadCount}</span>
					</button>

					<button
						type="button"
						onclick={() => dashboardFilter = 'draft'}
						class="px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 {dashboardFilter === 'draft' ? 'bg-amber-600 text-white shadow-sm' : 'glass-pill text-[#516f8e] dark:text-white/70 hover:text-amber-500'}"
					>
						<span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
						<span>Draft</span>
						<span class="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 dark:bg-white/20">{draftCount}</span>
					</button>

					<button
						type="button"
						onclick={() => dashboardFilter = 'arsip'}
						class="px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 {dashboardFilter === 'arsip' ? 'bg-purple-600 text-white shadow-sm' : 'glass-pill text-[#516f8e] dark:text-white/70 hover:text-purple-500'}"
					>
						<span class="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
						<span>Arsip</span>
						<span class="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 dark:bg-white/20">{arsipCount}</span>
					</button>
				</div>

				<!-- Article Cards Grid -->
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					{#each filteredPosts as post}
						<div class="glass-panel p-5 rounded-2xl border border-sky-200/60 dark:border-white/20 text-[#061a2e] dark:text-white hover:border-[#0593C6]/40 dark:hover:border-white/40 hover:bg-white/90 dark:hover:bg-white/15 transition flex flex-col justify-between {editingSlug === post.slug ? 'ring-2 ring-[#0593C6] dark:ring-sky-400 bg-sky-500/5' : ''}">
							<div>
								<div class="flex items-center justify-between text-[11px] text-[#516f8e] dark:text-white/70 mb-2">
									<div class="flex items-center gap-1.5 flex-wrap">
										<span class="px-2 py-0.5 rounded-full glass-pill text-[#0593C6] dark:text-white font-semibold">{post.metadata.category}</span>
										{#if post.metadata.status === 'arsip'}
											<span class="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-300 font-bold text-[10px] border border-purple-400/30">Arsip</span>
										{:else if post.metadata.status === 'draft' || post.metadata.published === false}
											<span class="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-300 font-bold text-[10px] border border-amber-400/30">Draft</span>
										{:else}
											<span class="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 font-bold text-[10px] border border-emerald-400/30">Upload</span>
										{/if}
									</div>
									<span>{post.metadata.date}</span>
								</div>
								<h4 class="font-bold text-sm text-[#061a2e] dark:text-white line-clamp-2 mb-1.5">{post.metadata.title}</h4>
								<p class="text-xs text-[#516f8e] dark:text-white/50 font-mono">src/posts/{post.slug}.md</p>
							</div>

							<!-- Action & Status Management Toolbar -->
							<div class="pt-3.5 mt-4 border-t border-sky-100/70 dark:border-white/10 space-y-3">
								<!-- Quick Status Switcher Row -->
								<div class="flex items-center justify-between text-xs">
									<span class="text-[11px] font-medium text-[#516f8e] dark:text-white/60">Ubah status:</span>
									<div class="flex items-center gap-1.5">
										{#if post.metadata.status !== 'upload'}
											<button
												type="button"
												disabled={isUpdatingStatus}
												onclick={() => updatePostStatus(post.slug, 'upload', post.metadata.title)}
												class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 transition cursor-pointer"
												title="Ubah status ke Upload (Terbitkan)"
											>
												Terbitkan
											</button>
										{/if}

										{#if post.metadata.status !== 'draft'}
											<button
												type="button"
												disabled={isUpdatingStatus}
												onclick={() => updatePostStatus(post.slug, 'draft', post.metadata.title)}
												class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 transition cursor-pointer"
												title="Ubah status ke Draft"
											>
												Draft
											</button>
										{/if}

										{#if post.metadata.status !== 'arsip'}
											<button
												type="button"
												disabled={isUpdatingStatus}
												onclick={() => updatePostStatus(post.slug, 'arsip', post.metadata.title)}
												class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 transition cursor-pointer"
												title="Ubah status ke Arsip"
											>
												Arsip
											</button>
										{/if}
									</div>
								</div>

								<!-- Bottom Action Links Row -->
								<div class="flex items-center justify-between text-xs pt-2.5 border-t border-sky-100/60 dark:border-white/10">
									<!-- Clickable Eye badge for Viewers & Referrers -->
									<button
										type="button"
										onclick={() => {
											const refs = (data.referrers && (data.referrers as any)[post.slug]) || {};
											const tot = (data.views && (data.views as any)[post.slug]) || 0;
											viewingReferrerPost = { slug: post.slug, title: post.metadata.title, referrers: refs, total: tot };
										}}
										class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0593C6]/10 hover:bg-[#0593C6]/20 dark:bg-white/10 dark:hover:bg-white/20 text-[#0593C6] dark:text-sky-200 border border-[#0593C6]/25 dark:border-white/20 font-bold text-xs transition cursor-pointer group shadow-2xs"
										title="Klik untuk melihat rincian sumber pembaca artikel ini"
									>
										<Eye class="w-3.5 h-3.5 group-hover:scale-110 text-[#0593C6] dark:text-sky-300 transition-transform" />
										<span>{(data.views && (data.views as any)[post.slug]) || 0} pembaca</span>
									</button>

									<div class="flex items-center gap-1.5">
										<!-- Edit button to load into editor -->
										<button
											type="button"
											onclick={() => loadPostForEditing(post.slug)}
											disabled={isLoadingPost}
											class="px-2.5 py-1 rounded-lg bg-[#0593C6] hover:bg-[#047ea8] text-white dark:bg-white dark:text-[#0593C6] dark:hover:bg-slate-100 font-bold text-xs transition cursor-pointer flex items-center gap-1 shadow-sm disabled:opacity-70"
											title="Buka dan edit di form penulisan"
										>
											{#if loadingPostSlug === post.slug}
												<span class="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
												<span class="text-current">Memuat...</span>
											{:else}
												<Pencil class="w-3 h-3 text-current" />
												<span class="text-current">Edit</span>
											{/if}
										</button>

										<!-- Preview / Buka link -->
										<a
											href="/artikel/{post.slug}"
											target="_blank"
											class="text-[#0593C6] dark:text-white/80 hover:text-[#D83995] dark:hover:text-[#f29185] font-semibold text-xs transition flex items-center gap-0.5 px-1.5 py-1"
											title={post.metadata.published === false ? 'Pratinjau Draf' : 'Buka Halaman Artikel'}
										>
											<span>{post.metadata.published === false ? 'Preview' : 'Buka'}</span>
											<span class="text-[10px]">↗</span>
										</a>

										<!-- Delete file button -->
										<button
											type="button"
											onclick={() => deletePostFile(post.slug, post.metadata.title)}
											class="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
											title="Hapus file artikel ini"
										>
											<Trash2 class="w-3.5 h-3.5" />
										</button>
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- ================= REFERRER BREAKDOWN MODAL (Admin) ================= -->
{#if viewingReferrerPost}
	<div
		class="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
		onclick={(e) => {
			if (e.target === e.currentTarget) viewingReferrerPost = null;
		}}
		role="presentation"
	>
		<div
			class="bg-white/95 dark:bg-[#071626]/98 backdrop-blur-2xl border border-sky-200/50 dark:border-white/20 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative text-[#061a2e] dark:text-white my-8 animate-in fade-in zoom-in-95 duration-200"
		>
			<button
				type="button"
				onclick={() => (viewingReferrerPost = null)}
				class="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-rose-500 hover:bg-white/10 dark:hover:bg-white/15 transition cursor-pointer"
				title="Tutup dialog"
			>
				<X class="w-5 h-5" />
			</button>

			<div class="mb-4 pr-8">
				<div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-2">
					<Share2 class="w-3.5 h-3.5" />
					<span>Rincian Sumber Pembaca</span>
				</div>
				<h3 class="text-base font-black text-[#061a2e] dark:text-white leading-snug">
					{viewingReferrerPost.title}
				</h3>
				<p class="text-[11px] font-mono text-slate-400 mt-1">
					src/posts/{viewingReferrerPost.slug}.md
				</p>
			</div>

			<div class="space-y-2 mb-6">
				{#each Object.entries(viewingReferrerPost.referrers || {}) as [src, count]}
					<div class="flex items-center justify-between p-3 rounded-xl bg-sky-500/5 dark:bg-white/5 border border-sky-200/50 dark:border-white/10 text-xs">
						<span class="font-bold text-[#061a2e] dark:text-white">{formatPlatformName(src)}</span>
						<span class="px-2.5 py-0.5 rounded-full bg-[#0593C6]/20 text-[#0593C6] dark:text-sky-200 font-extrabold">{count} pembaca</span>
					</div>
				{:else}
					<div class="p-4 rounded-xl bg-sky-500/5 dark:bg-white/5 text-center text-xs text-slate-400 italic">
						Belum ada data rujukan spesifik. Saat pembaca membuka tautan dari media sosial (WhatsApp, Instagram, TikTok, dsb.), platformnya akan tercatat di sini.
					</div>
				{/each}
			</div>

			<div class="pt-3 border-t border-sky-100/60 dark:border-white/10 flex justify-between items-center text-xs">
				<span class="text-slate-500 dark:text-slate-400">Total Pembaca:</span>
				<span class="font-black text-sm text-[#0593C6] dark:text-white">{viewingReferrerPost.total}</span>
			</div>
		</div>
	</div>
{/if}

<!-- ================= DELETE CONFIRMATION MODAL (Liquid Glass) ================= -->
{#if deleteTarget}
	<div
		class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
		onclick={(e) => {
			if (e.target === e.currentTarget && !isDeletingPost) deleteTarget = null;
		}}
		role="presentation"
	>
		<div
			class="bg-white/95 dark:bg-[#071626]/98 backdrop-blur-2xl border border-rose-500/30 dark:border-rose-400/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-[#061a2e] dark:text-white my-8 animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
		>
			<!-- Top Danger Accent Line -->
			<div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-[#D83995] to-amber-500"></div>

			<!-- Close Button -->
			<button
				type="button"
				disabled={isDeletingPost}
				onclick={() => (deleteTarget = null)}
				class="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-500/10 transition cursor-pointer disabled:opacity-50"
				title="Tutup dialog"
			>
				<X class="w-5 h-5" />
			</button>

			<!-- Header Icon & Title -->
			<div class="flex items-start gap-4 mb-5">
				<div class="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 shadow-sm">
					<Trash2 class="w-6 h-6" />
				</div>
				<div>
					<div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 text-[10px] font-extrabold uppercase tracking-wider mb-1.5 border border-rose-500/20">
						Konfirmasi Hapus
					</div>
					<h3 class="text-lg font-black text-[#061a2e] dark:text-white leading-snug">
						{deleteTarget.isDraftFormOnly ? 'Bersihkan Form Draft?' : 'Hapus Tulisan Permanen?'}
					</h3>
				</div>
			</div>

			<!-- Message Body -->
			<div class="mb-6 space-y-3">
				<p class="text-xs sm:text-sm text-[#4b6a8a] dark:text-sky-100/80 leading-relaxed">
					{#if deleteTarget.isDraftFormOnly}
						Apakah Anda yakin ingin mengosongkan form tulisan ini? Draft dan autosave lokal yang belum disimpan ke file akan dibersihkan.
					{:else}
						Tindakan ini <strong class="text-rose-600 dark:text-rose-400">tidak dapat dibatalkan</strong>. File tulisan markdown berikut akan dihapus secara permanen dari project:
					{/if}
				</p>

				{#if !deleteTarget.isDraftFormOnly}
					<div class="p-3.5 rounded-2xl bg-rose-500/5 dark:bg-white/5 border border-rose-500/20 dark:border-white/10 space-y-1">
						<div class="font-bold text-xs sm:text-sm text-[#061a2e] dark:text-white truncate">
							"{deleteTarget.title}"
						</div>
						<div class="font-mono text-[11px] text-rose-700 dark:text-rose-300 flex items-center gap-1">
							<span>📄</span>
							<span>src/posts/{deleteTarget.slug}.md</span>
						</div>
					</div>
				{/if}
			</div>

			<!-- Action Buttons -->
			<div class="flex items-center justify-center gap-3 pt-2">
				<button
					type="button"
					disabled={isDeletingPost}
					onclick={() => (deleteTarget = null)}
					class="px-5 py-2.5 rounded-xl border border-sky-200/60 dark:border-white/20 text-xs font-bold text-[#061a2e] dark:text-white hover:bg-sky-500/10 dark:hover:bg-white/10 transition cursor-pointer disabled:opacity-50"
				>
					Batal
				</button>

				<button
					type="button"
					disabled={isDeletingPost}
					onclick={confirmDelete}
					class="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
				>
					{#if isDeletingPost}
						<span class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
						<span>Menghapus...</span>
					{:else}
						<Trash2 class="w-3.5 h-3.5" />
						<span>{deleteTarget.isDraftFormOnly ? 'Bersihkan Form' : 'Hapus'}</span>
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}
