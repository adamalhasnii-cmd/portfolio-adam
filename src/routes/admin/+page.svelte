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
		Undo2
	} from '@lucide/svelte';

	let { data, form }: PageProps & { form: ActionData } = $props();

	const totalViews = $derived(
		Object.values((data as any)?.views || {}).reduce(
			(acc: number, curr: any) => acc + (Number(curr) || 0),
			0
		)
	);

	const uploadCount = $derived(
		(data.posts || []).filter((p: any) => p.metadata?.published !== false).length
	);

	const draftCount = $derived(
		(data.posts || []).filter((p: any) => p.metadata?.published === false).length
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

	// Save Post Action (Upload or Draft)
	async function savePost(publish: boolean = true) {
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
					description,
					category,
					tags,
					readTime,
					content,
					published: publish,
					author: 'Adam Alhasni'
				})
			});

			const resData = await res.json();

			if (resData.success) {
				const actionName = publish ? 'di-upload & dipublikasikan' : 'disimpan sebagai Draft';
				saveMessage = {
					type: 'success',
					text: `Artikel "${title}" berhasil ${actionName}!`
				};
				// Autosave is temporary until author uploads, drafts, or deletes
				try {
					localStorage.removeItem(AUTOSAVE_STORAGE_KEY);
				} catch {}
				autoSaveStatus = `Telah ${actionName}`;
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
		if (!confirm('Apakah Anda yakin ingin menghapus draft ini? Semua isi penulisan dan autosave sementara akan dibersihkan.')) {
			return;
		}

		try {
			localStorage.removeItem(AUTOSAVE_STORAGE_KEY);
		} catch {}

		title = '';
		slug = '';
		slugManuallyEdited = false;
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
			text: 'Draft penulisan dan autosave sementara telah berhasil dibersihkan.'
		};
	}
</script>

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
				<div class="flex justify-center mb-8">
					<div class="w-14 h-14 rounded-2xl bg-[#0593C6] text-white dark:bg-white/20 dark:border dark:border-white/35 flex items-center justify-center font-black text-2xl shadow-lg backdrop-blur-md">
						<span>9</span>
						<span class="w-2 h-2 rounded-full bg-[#D83995] ml-0.5 -mt-3"></span>
					</div>
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
								class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#516f8e] dark:text-white/60 hover:text-[#0593C6] dark:hover:text-white transition cursor-pointer"
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
						class="w-full py-3.5 px-4 rounded-xl bg-[#0593C6] text-white hover:bg-[#047ea8] dark:bg-white dark:text-[#0593C6] font-extrabold text-sm hover:scale-[1.01] active:scale-[0.99] transition shadow-lg shadow-[#0593C6]/25 dark:shadow-black/10 cursor-pointer flex items-center justify-center gap-2 mt-4"
					>
						<span>Login</span>
					</button>
				</form>
			</div>
		</div>
	</div>
{:else}
	<!-- AUTHENTICATED WRITING STUDIO (Liquid Glass Aesthetic) -->
	<div class="py-6 sm:py-10 text-[#061a2e] dark:text-white transition-colors">
		<div class="max-w-7xl mx-auto px-4 sm:px-6">
			<!-- Top Bar with Logout -->
			<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-sky-200/50 dark:border-white/20">
				<div>
					<h1 class="text-2xl sm:text-3xl font-black text-[#061a2e] dark:text-white tracking-tight drop-shadow-xs">
						Draft Penulisan
					</h1>
					{#if autoSaveStatus}
						<span class="text-xs text-[#0593C6] dark:text-sky-300 font-medium inline-flex items-center gap-1.5 mt-1.5">
							<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
							{autoSaveStatus}
						</span>
					{/if}
				</div>

				<!-- Action Buttons Group (Upload, Draft, Hapus, Keluar) -->
				<div class="flex flex-wrap items-center gap-2 sm:gap-3">
					<button
						type="button"
						onclick={() => savePost(true)}
						disabled={isSaving}
						class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0593C6] text-white hover:bg-[#047ea8] dark:bg-white dark:text-[#0593C6] text-xs font-bold active:scale-[0.99] transition cursor-pointer shadow-lg shadow-[#0593C6]/25 disabled:opacity-50"
						title="Upload dan publikasikan tulisan ini"
					>
						<Upload class="w-4 h-4" />
						<span>{isSaving ? 'Mengupload...' : 'Upload'}</span>
					</button>

					<button
						type="button"
						onclick={() => savePost(false)}
						disabled={isSaving}
						class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl glass-pill text-[#0593C6] dark:text-sky-200 hover:bg-[#0593C6]/10 border border-[#0593C6]/30 text-xs font-bold transition cursor-pointer"
						title="Simpan sebagai Draft di project"
					>
						<Bookmark class="w-4 h-4 text-[#0593C6] dark:text-sky-300" />
						<span>Draft</span>
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

			<!-- Main Two-Column Layout -->
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
				<!-- LEFT COLUMN: Editor Form -->
				<div class="space-y-5 glass-panel p-6 sm:p-7 rounded-3xl text-[#061a2e] dark:text-white border border-sky-200/60 dark:border-white/20 {activeTab === 'preview' ? 'hidden lg:block' : ''}">
					<div class="flex items-center justify-between pb-3 border-b border-sky-200/50 dark:border-white/15">
						<h2 class="font-black text-base text-[#061a2e] dark:text-white flex items-center gap-2">
							<FileText class="w-4 h-4 text-[#D83995]" />
							Metadata & Tulisan
						</h2>
						<button type="button" onclick={handleDeleteDraft} class="text-xs text-[#516f8e] dark:text-white/60 hover:text-rose-500 dark:hover:text-rose-300 transition cursor-pointer">
							Kosongkan Form
						</button>
					</div>

					<!-- Judul Input -->
					<div>
						<label for="post-title" class="block text-xs font-bold text-[#061a2e] dark:text-white uppercase tracking-wider mb-1.5">
							Judul Artikel *
						</label>
						<input
							id="post-title"
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

				<!-- RIGHT COLUMN: Live Preview -->
				<div class="glass-panel p-6 sm:p-8 rounded-3xl text-[#061a2e] dark:text-white sticky top-28 border border-sky-200/60 dark:border-white/20 {activeTab === 'editor' ? 'hidden lg:block' : ''}">
					<div class="flex items-center justify-between pb-4 mb-6 border-b border-sky-200/50 dark:border-white/15">
						<div class="flex items-center gap-2">
							<Eye class="w-4 h-4 text-[#D83995]" />
							<span class="font-black text-sm text-[#061a2e] dark:text-white">Live Preview Pembaca</span>
						</div>
						<span class="text-xs px-3 py-1 rounded-full glass-pill font-semibold text-[#0593C6] dark:text-white">
							{category}
						</span>
					</div>

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

			<!-- Existing Posts Section in Admin -->
			<div class="mt-16 pt-10 border-t border-sky-200/50 dark:border-white/20">
				<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
					<div class="flex items-center gap-2">
						<Layers class="w-5 h-5 text-[#D83995]" />
						<h3 class="text-lg font-black text-[#061a2e] dark:text-white">Artikel & Statistik Viewer ({data.posts?.length || 0})</h3>
					</div>
					<div>
						<a href="/artikel" class="text-xs font-semibold text-[#0593C6] dark:text-white/90 hover:underline flex items-center gap-1">
							<span>Lihat halaman pembaca</span>
							<span>→</span>
						</a>
					</div>
				</div>

				<!-- Stats Overview Cards (Compact & Centered) -->
				<div class="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
					<div class="glass-panel p-3.5 sm:p-4 rounded-2xl border border-sky-200/60 dark:border-white/20 text-center flex flex-col items-center justify-center shadow-sm">
						<div class="text-[11px] sm:text-xs text-[#516f8e] dark:text-white/70 font-semibold mb-1 flex items-center justify-center gap-1.5">
							<Upload class="w-3.5 h-3.5 text-emerald-500" />
							<span>Total Artikel (Upload)</span>
						</div>
						<div class="text-2xl font-black text-[#061a2e] dark:text-white">{uploadCount}</div>
					</div>

					<div class="glass-panel p-3.5 sm:p-4 rounded-2xl border border-sky-200/60 dark:border-white/20 text-center flex flex-col items-center justify-center shadow-sm">
						<div class="text-[11px] sm:text-xs text-[#516f8e] dark:text-white/70 font-semibold mb-1 flex items-center justify-center gap-1.5">
							<Bookmark class="w-3.5 h-3.5 text-[#0593C6] dark:text-sky-300" />
							<span>Total Artikel (Draft)</span>
						</div>
						<div class="text-2xl font-black text-[#061a2e] dark:text-white">{draftCount}</div>
					</div>

					<div class="glass-panel p-3.5 sm:p-4 rounded-2xl border border-sky-200/60 dark:border-white/20 text-center flex flex-col items-center justify-center shadow-sm">
						<div class="text-[11px] sm:text-xs text-[#516f8e] dark:text-white/70 font-semibold mb-1 flex items-center justify-center gap-1.5">
							<Eye class="w-3.5 h-3.5 text-[#0593C6]" />
							<span>Total Pembaca Tulisan</span>
						</div>
						<div class="text-2xl font-black text-[#0593C6] dark:text-sky-300">{totalViews}</div>
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					{#each (data.posts || []) as post}
						<div class="glass-panel p-5 rounded-2xl border border-sky-200/60 dark:border-white/20 text-[#061a2e] dark:text-white hover:border-[#0593C6]/40 dark:hover:border-white/40 hover:bg-white/90 dark:hover:bg-white/15 transition flex flex-col justify-between">
							<div>
								<div class="flex items-center justify-between text-[11px] text-[#516f8e] dark:text-white/70 mb-2">
									<div class="flex items-center gap-1.5">
										<span class="px-2 py-0.5 rounded-full glass-pill text-[#0593C6] dark:text-white font-semibold">{post.metadata.category}</span>
										{#if post.metadata.published === false}
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
							<div class="pt-3 mt-3 border-t border-sky-100 dark:border-white/15 flex items-center justify-between text-xs">
								<div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0593C6]/10 text-[#0593C6] dark:bg-white/10 dark:text-sky-200 border border-[#0593C6]/20 dark:border-white/20 font-bold text-xs" title="Jumlah pembaca unik">
									<Eye class="w-3.5 h-3.5" />
									<span>{(data.views && (data.views as any)[post.slug]) || 0} pembaca</span>
								</div>
								{#if post.metadata.published !== false}
									<a href="/artikel/{post.slug}" target="_blank" class="text-[#0593C6] dark:text-white font-semibold hover:text-[#D83995] dark:hover:text-[#f29185] transition flex items-center gap-1">
										<span>Buka Artikel</span>
										<span>↗</span>
									</a>
								{:else}
									<span class="text-xs text-amber-600 dark:text-amber-300 font-semibold italic">Belum terbit</span>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
{/if}
