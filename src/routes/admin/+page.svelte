<script lang="ts">
	import type { PageProps, ActionData } from './$types';
	import { marked } from 'marked';
	import {
		PenTool,
		Eye,
		EyeOff,
		Save,
		Copy,
		Download,
		Check,
		AlertCircle,
		Sparkles,
		Tag,
		Calendar,
		Clock,
		BookOpen,
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
		LogOut
	} from '@lucide/svelte';

	let { data, form }: PageProps & { form: ActionData } = $props();

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
	let copied = $state(false);

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

	// Save Post Action (writes to src/posts/*.md in local dev)
	async function savePostToProject() {
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
					author: '911'
				})
			});

			const resData = await res.json();

			if (resData.success) {
				saveMessage = {
					type: 'success',
					text: `Berhasil tersimpan ke file: src/posts/${resData.slug}.md! Silakan buka artikel di web.`
				};
			} else if (resData.readOnly) {
				saveMessage = {
					type: 'info',
					text: 'Website berjalan di Vercel (read-only cloud). Gunakan tombol "Salin Markdown" atau "Unduh .md" di atas untuk menyimpan tulisan Anda.'
				};
			} else {
				saveMessage = { type: 'error', text: resData.error || 'Gagal menyimpan tulisan.' };
			}
		} catch (err: any) {
			saveMessage = { type: 'error', text: 'Koneksi gagal: ' + err.message };
		} finally {
			isSaving = false;
		}
	}

	// Copy full markdown to clipboard
	function copyToClipboard() {
		navigator.clipboard.writeText(fullMarkdown);
		copied = true;
		saveMessage = {
			type: 'success',
			text: 'Seluruh teks Markdown & Frontmatter berhasil disalin ke clipboard!'
		};
		setTimeout(() => {
			copied = false;
		}, 3000);
	}

	// Download .md file
	function downloadMarkdownFile() {
		const filename = `${slug || 'tulisan-baru'}.md`;
		const blob = new Blob([fullMarkdown], { type: 'text/markdown;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = filename;
		link.click();
		URL.revokeObjectURL(url);
		saveMessage = { type: 'success', text: `File "${filename}" berhasil diunduh ke laptop Anda!` };
	}

	function resetForm() {
		if (confirm('Apakah Anda yakin ingin mengosongkan formulir?')) {
			title = '';
			slug = '';
			description = '';
			tags = 'Investasi, Keuangan';
			content = '';
			saveMessage = null;
		}
	}
</script>

<svelte:head>
	<title>{data.isAuthenticated ? 'Studio Penulis (Admin)' : 'Login'} — 911</title>
</svelte:head>

{#if !data.isAuthenticated}
	<!-- LOGIN SCREEN (Liquid Glass Sky Blue & Hot Pink) -->
	<div class="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 text-white">
		<div class="w-full max-w-md">
			<!-- Login Card (Liquid Glass) -->
			<div class="glass-panel rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden transition-all text-white">
				<!-- Accent top gradient line -->
				<div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-white via-[#D83995] to-[#f29185]"></div>

				<!-- Logo / Monogram -->
				<div class="flex justify-center mb-8">
					<div class="w-14 h-14 rounded-2xl bg-white/20 border border-white/35 text-white flex items-center justify-center font-black text-2xl shadow-lg backdrop-blur-md">
						<span>9</span>
						<span class="w-2 h-2 rounded-full bg-[#D83995] ml-0.5 -mt-3"></span>
					</div>
				</div>

				<!-- Error alert if login fails -->
				{#if form?.error}
					<div class="mb-6 p-3.5 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-100 text-xs font-medium flex items-center gap-2.5 animate-in fade-in duration-200">
						<AlertCircle class="w-4 h-4 text-rose-300 shrink-0" />
						<span>{form.error}</span>
					</div>
				{/if}

				<!-- Login Form -->
				<form method="POST" action="?/login" class="space-y-5">
					<div>
						<label for="admin-user" class="block text-xs font-bold text-white uppercase tracking-wider mb-2">
							Username
						</label>
						<div class="relative">
							<div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/60">
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
								class="w-full pl-10 pr-4 py-3 rounded-xl border border-white/25 bg-white/10 dark:bg-black/30 text-white placeholder:text-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white transition backdrop-blur-md"
							/>
						</div>
					</div>

					<div>
						<label for="admin-pass" class="block text-xs font-bold text-white uppercase tracking-wider mb-2">
							Password
						</label>
						<div class="relative">
							<div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/60">
								<Lock class="w-4 h-4" />
							</div>
							<input
								id="admin-pass"
								name="password"
								type={showPassword ? 'text' : 'password'}
								required
								autocomplete="current-password"
								placeholder="••••••••••••"
								class="w-full pl-10 pr-11 py-3 rounded-xl border border-white/25 bg-white/10 dark:bg-black/30 text-white placeholder:text-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white transition backdrop-blur-md"
							/>
							<button
								type="button"
								onclick={() => showPassword = !showPassword}
								class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-white/60 hover:text-white transition cursor-pointer"
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
						class="w-full py-3.5 px-4 rounded-xl bg-white text-[#0593C6] font-extrabold text-sm hover:bg-white/95 active:scale-[0.99] transition shadow-lg shadow-black/10 cursor-pointer flex items-center justify-center gap-2 mt-4"
					>
						<span>Login</span>
					</button>
				</form>
			</div>
		</div>
	</div>
{:else}
	<!-- AUTHENTICATED WRITING STUDIO (Liquid Glass Aesthetic) -->
	<div class="py-6 sm:py-10 text-white transition-colors">
		<div class="max-w-7xl mx-auto px-4 sm:px-6">
			<!-- Top Bar with Logout -->
			<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-white/20">
				<div>
					<div class="flex items-center gap-2 mb-2">
						<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill text-white text-xs font-semibold">
							<PenTool class="w-3.5 h-3.5 text-[#D83995]" />
							Studio Penulis (Aktif)
						</span>
						<span class="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300 glass-pill px-2.5 py-1 rounded-full border border-emerald-400/30">
							<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
							Masuk sebagai adamin
						</span>
					</div>
					<h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-sm">
						Tulis & Publikasikan Pemikiran Anda
					</h1>
					<p class="text-xs sm:text-sm text-sky-100/80 mt-1">
						Ketik langsung dengan format Markdown dan Live Preview real-time.
					</p>
				</div>

				<!-- Action Buttons Group + Logout -->
				<div class="flex flex-wrap items-center gap-2 sm:gap-3">
					<button
						onclick={copyToClipboard}
						class="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl glass-pill hover:bg-white/25 text-white text-xs font-semibold transition cursor-pointer"
						title="Salin seluruh isi Markdown ke clipboard"
					>
						{#if copied}
							<Check class="w-4 h-4 text-emerald-300" />
							<span class="text-emerald-300 font-bold">Tersalin!</span>
						{:else}
							<Copy class="w-4 h-4 text-white/80" />
							<span>Salin Markdown</span>
						{/if}
					</button>

					<button
						onclick={downloadMarkdownFile}
						class="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl glass-pill hover:bg-white/25 text-white text-xs font-semibold transition cursor-pointer"
						title="Unduh file .md"
					>
						<Download class="w-4 h-4 text-white/80" />
						<span>Unduh .md</span>
					</button>

					<button
						onclick={savePostToProject}
						disabled={isSaving}
						class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#0593C6] text-xs font-extrabold hover:bg-white/95 active:scale-[0.99] transition cursor-pointer shadow-lg shadow-black/10 disabled:opacity-50"
					>
						<Save class="w-4 h-4" />
						<span>{isSaving ? 'Menyimpan...' : 'Simpan ke Project (.md)'}</span>
					</button>

					<!-- Logout Form -->
					<form method="POST" action="?/logout" class="inline-block">
						<button
							type="submit"
							class="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl glass-pill text-rose-300 hover:text-white hover:bg-rose-500/25 border-rose-400/30 text-xs font-semibold transition cursor-pointer"
							title="Keluar dari sesi admin"
						>
							<LogOut class="w-4 h-4" />
							<span>Keluar</span>
						</button>
					</form>
				</div>
			</div>

			<!-- Status Message Toast -->
			{#if saveMessage}
				<div class="mb-6 p-4 rounded-2xl flex items-start gap-3 text-sm animate-in fade-in duration-200 {saveMessage.type === 'success'
					? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-100'
					: saveMessage.type === 'info'
					? 'bg-sky-500/20 border border-sky-400/40 text-sky-100'
					: 'bg-rose-500/20 border border-rose-400/40 text-rose-100'} glass-panel">
					{#if saveMessage.type === 'success'}
						<Check class="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />
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
					class="flex-1 py-2 text-xs font-bold rounded-xl transition {activeTab === 'editor' ? 'bg-white text-[#0593C6] shadow-sm' : 'text-white/80 hover:text-white'}"
				>
					Editor Ketik
				</button>
				<button
					onclick={() => activeTab = 'preview'}
					class="flex-1 py-2 text-xs font-bold rounded-xl transition {activeTab === 'preview' ? 'bg-white text-[#0593C6] shadow-sm' : 'text-white/80 hover:text-white'}"
				>
					Live Preview
				</button>
			</div>

			<!-- Main Two-Column Layout -->
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
				<!-- LEFT COLUMN: Editor Form -->
				<div class="space-y-5 glass-panel p-6 sm:p-7 rounded-3xl text-white {activeTab === 'preview' ? 'hidden lg:block' : ''}">
					<div class="flex items-center justify-between pb-3 border-b border-white/15">
						<h2 class="font-black text-base text-white flex items-center gap-2">
							<FileText class="w-4 h-4 text-[#D83995]" />
							Metadata & Tulisan
						</h2>
						<button onclick={resetForm} class="text-xs text-white/60 hover:text-rose-300 transition cursor-pointer">
							Kosongkan Form
						</button>
					</div>

					<!-- Judul Input -->
					<div>
						<label for="post-title" class="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
							Judul Artikel *
						</label>
						<input
							id="post-title"
							type="text"
							bind:value={title}
							oninput={onTitleInput}
							placeholder="Contoh: Mengapa Uang Tunai Tetap Berharga di Saat Suku Bunga Tinggi"
							class="w-full px-4 py-2.5 rounded-xl border border-white/20 bg-white/10 dark:bg-black/30 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white text-sm placeholder:text-white/45 backdrop-blur-md transition"
						/>
					</div>

					<!-- Slug & Category Row -->
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label for="post-slug" class="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
								Slug URL
							</label>
							<input
								id="post-slug"
								type="text"
								bind:value={slug}
								oninput={() => slugManuallyEdited = true}
								placeholder="mengapa-uang-tunai-berharga"
								class="w-full px-3.5 py-2.5 rounded-xl border border-white/20 bg-white/10 dark:bg-black/30 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white placeholder:text-white/45 backdrop-blur-md transition"
							/>
						</div>

						<div>
							<label for="post-category" class="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
								Kategori
							</label>
							<select
								id="post-category"
								bind:value={category}
								class="w-full px-3.5 py-2.5 rounded-xl border border-white/20 bg-white/15 dark:bg-black/40 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white backdrop-blur-md transition cursor-pointer"
							>
								<option value="Investasi" class="bg-[#051a2e] text-white">Investasi</option>
								<option value="Mindset Keuangan" class="bg-[#051a2e] text-white">Mindset Keuangan</option>
								<option value="Opini Dunia" class="bg-[#051a2e] text-white">Opini Dunia</option>
								<option value="Geopolitik" class="bg-[#051a2e] text-white">Geopolitik</option>
								<option value="Refleksi Hidup" class="bg-[#051a2e] text-white">Refleksi Hidup</option>
								<option value="Analisis Pasar" class="bg-[#051a2e] text-white">Analisis Pasar</option>
							</select>
						</div>
					</div>

					<!-- Description / Excerpt -->
					<div>
						<label for="post-desc" class="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
							Ringkasan Singkat (Lead / Excerpt)
						</label>
						<textarea
							id="post-desc"
							bind:value={description}
							rows="2"
							placeholder="Satu atau dua kalimat yang merangkum pesan utama tulisan ini..."
							class="w-full px-3.5 py-2.5 rounded-xl border border-white/20 bg-white/10 dark:bg-black/30 text-white text-xs focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white leading-relaxed placeholder:text-white/45 backdrop-blur-md transition"
						></textarea>
					</div>

					<!-- Tags & ReadTime Row -->
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label for="post-tags" class="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
								Tags (Pisahkan koma)
							</label>
							<input
								id="post-tags"
								type="text"
								bind:value={tags}
								placeholder="Investasi, Cashflow, Saham"
								class="w-full px-3.5 py-2.5 rounded-xl border border-white/20 bg-white/10 dark:bg-black/30 text-white text-xs focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white placeholder:text-white/45 backdrop-blur-md transition"
							/>
						</div>
						<div>
							<label for="post-readtime" class="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
								Estimasi Waktu Baca
							</label>
							<input
								id="post-readtime"
								type="text"
								bind:value={readTime}
								placeholder="5 min baca"
								class="w-full px-3.5 py-2.5 rounded-xl border border-white/20 bg-white/10 dark:bg-black/30 text-white text-xs focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white placeholder:text-white/45 backdrop-blur-md transition"
							/>
						</div>
					</div>

					<!-- Formatting Toolbar -->
					<div>
						<div class="flex items-center justify-between mb-2">
							<label for="markdown-editor" class="text-xs font-bold text-white uppercase tracking-wider">
								Isi Konten (Markdown)
							</label>
							<div class="text-[11px] text-white/60">
								{content.length} karakter • {content.split(/\s+/).filter(Boolean).length} kata
							</div>
						</div>

						<div class="flex flex-wrap items-center gap-1 p-2 bg-white/10 dark:bg-black/35 border border-white/20 rounded-t-2xl text-white backdrop-blur-md">
							<button type="button" onclick={() => insertFormatting('## ')} class="p-1.5 hover:bg-white/25 rounded-lg text-white/80 hover:text-white transition cursor-pointer" title="Heading 2">
								<Heading2 class="w-4 h-4" />
							</button>
							<button type="button" onclick={() => insertFormatting('### ')} class="p-1.5 hover:bg-white/25 rounded-lg text-white/80 hover:text-white transition cursor-pointer" title="Heading 3">
								<Heading3 class="w-4 h-4" />
							</button>
							<button type="button" onclick={() => insertFormatting('**', '**')} class="p-1.5 hover:bg-white/25 rounded-lg text-white/80 hover:text-white transition cursor-pointer" title="Tebal (Bold)">
								<Bold class="w-4 h-4" />
							</button>
							<button type="button" onclick={() => insertFormatting('*', '*')} class="p-1.5 hover:bg-white/25 rounded-lg text-white/80 hover:text-white transition cursor-pointer" title="Miring (Italic)">
								<Italic class="w-4 h-4" />
							</button>
							<button type="button" onclick={() => insertFormatting('> ')} class="p-1.5 hover:bg-white/25 rounded-lg text-[#f29185] hover:text-white transition cursor-pointer" title="Kutipan (Blockquote)">
								<Quote class="w-4 h-4" />
							</button>
							<button type="button" onclick={() => insertFormatting('* ')} class="p-1.5 hover:bg-white/25 rounded-lg text-white/80 hover:text-white transition cursor-pointer" title="Daftar Poin">
								<List class="w-4 h-4" />
							</button>
							<button type="button" onclick={() => insertFormatting('```\n', '\n```')} class="p-1.5 hover:bg-white/25 rounded-lg text-white/80 hover:text-white transition cursor-pointer" title="Code Block">
								<Code class="w-4 h-4" />
							</button>
							<button type="button" onclick={() => insertFormatting('\n| Aset | Alokasi | Alasan |\n|---|---|---|\n| Kas | 40% | Ketahanan likuiditas |\n')} class="p-1.5 hover:bg-white/25 rounded-lg text-white/80 hover:text-white transition cursor-pointer" title="Tabel Keuangan">
								<Table class="w-4 h-4" />
							</button>
						</div>

						<textarea
							id="markdown-editor"
							bind:value={content}
							rows="16"
							placeholder="Mulai ketik cerita atau analisis Anda di sini..."
							class="w-full p-4 rounded-b-2xl border border-t-0 border-white/20 bg-white/5 dark:bg-black/35 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white leading-relaxed resize-y placeholder:text-white/45 backdrop-blur-md"
						></textarea>
					</div>
				</div>

				<!-- RIGHT COLUMN: Live Preview -->
				<div class="glass-panel p-6 sm:p-8 rounded-3xl text-white sticky top-28 {activeTab === 'editor' ? 'hidden lg:block' : ''}">
					<div class="flex items-center justify-between pb-4 mb-6 border-b border-white/15">
						<div class="flex items-center gap-2">
							<Eye class="w-4 h-4 text-[#D83995]" />
							<span class="font-black text-sm text-white">Live Preview Pembaca</span>
						</div>
						<span class="text-xs px-3 py-1 rounded-full glass-pill font-semibold text-white">
							{category}
						</span>
					</div>

					<!-- Preview Title -->
					<h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight mb-3 drop-shadow-sm">
						{title || 'Judul Artikel Akan Muncul di Sini'}
					</h1>

					<!-- Preview Description -->
					{#if description}
						<p class="text-white/80 text-sm leading-relaxed mb-4 font-normal italic">
							{description}
						</p>
					{/if}

					<!-- Preview Metadata Bar -->
					<div class="flex items-center gap-4 text-xs text-white/65 pb-5 mb-5 border-b border-white/15">
						<span class="font-bold text-white">911</span>
						<span>•</span>
						<div class="flex items-center gap-1.5">
							<Clock class="w-3.5 h-3.5 text-[#D83995]" />
							<span>{readTime}</span>
						</div>
						<span>•</span>
						<div class="flex items-center gap-1.5">
							<Calendar class="w-3.5 h-3.5 text-white/70" />
							<span>{new Date().toISOString().split('T')[0]}</span>
						</div>
					</div>

					<!-- Rendered Markdown Body -->
					<div class="preview-body prose prose-invert max-w-none text-sm text-white/90 leading-relaxed
						prose-headings:text-white prose-headings:font-black
						prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3 prose-h2:border-b prose-h2:border-white/15 prose-h2:pb-1.5
						prose-h3:text-lg prose-h3:mt-5 prose-h3:mb-2 prose-h3:text-white/90
						prose-blockquote:border-l-4 prose-blockquote:border-[#D83995] prose-blockquote:bg-[#D83995]/15 prose-blockquote:p-3.5 prose-blockquote:rounded-r-xl prose-blockquote:text-white/95 prose-blockquote:italic
						prose-code:text-[#f29185] prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-mono
						prose-table:border-collapse prose-th:bg-white/10 prose-th:text-white prose-th:p-2.5 prose-td:p-2.5 prose-td:border-b prose-td:border-white/10 prose-td:text-white/85">
						{@html renderedHtml}
					</div>
				</div>
			</div>

			<!-- Existing Posts Section in Admin -->
			<div class="mt-16 pt-10 border-t border-white/20">
				<div class="flex items-center justify-between mb-6">
					<div class="flex items-center gap-2">
						<Layers class="w-5 h-5 text-[#D83995]" />
						<h3 class="text-lg font-black text-white">Artikel yang Tersimpan di Project ({data.posts?.length || 0})</h3>
					</div>
					<a href="/artikel" class="text-xs font-semibold text-white/90 hover:text-white hover:underline flex items-center gap-1">
						<span>Lihat halaman pembaca</span>
						<span>→</span>
					</a>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					{#each (data.posts || []) as post}
						<div class="glass-panel p-5 rounded-2xl border border-white/20 text-white hover:border-white/40 hover:bg-white/15 transition flex flex-col justify-between">
							<div>
								<div class="flex items-center justify-between text-[11px] text-white/70 mb-2">
									<span class="px-2 py-0.5 rounded-full glass-pill text-white font-semibold">{post.metadata.category}</span>
									<span>{post.metadata.date}</span>
								</div>
								<h4 class="font-bold text-sm text-white line-clamp-2 mb-1.5">{post.metadata.title}</h4>
								<p class="text-xs text-white/50 font-mono">src/posts/{post.slug}.md</p>
							</div>
							<div class="pt-3 mt-3 border-t border-white/15 flex items-center justify-between text-xs">
								<a href="/artikel/{post.slug}" target="_blank" class="text-white font-semibold hover:text-[#f29185] transition flex items-center gap-1">
									<span>Buka Artikel</span>
									<span>↗</span>
								</a>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
{/if}
