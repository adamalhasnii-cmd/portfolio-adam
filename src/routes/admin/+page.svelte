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
		LogOut,
		ArrowLeft,
		Shield
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
			'author: "Adam Alhasni"',
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
					author: 'Adam Alhasni'
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
	<title>{data.isAuthenticated ? 'Studio Penulis (Admin)' : 'Login Admin'} — Adam Alhasni</title>
</svelte:head>

{#if !data.isAuthenticated}
	<!-- LOGIN SCREEN -->
	<div class="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 bg-[#FCFFFF]">
		<div class="w-full max-w-md">
			<!-- Back to home -->
			<div class="mb-6 text-center">
				<a
					href="/"
					class="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#0593C6] transition"
				>
					<ArrowLeft class="w-4 h-4" />
					Kembali ke Beranda Publik
				</a>
			</div>

			<!-- Login Card -->
			<div class="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-xl shadow-slate-200/40 relative overflow-hidden">
				<!-- Accent top gradient line -->
				<div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0593C6] via-[#D83995] to-[#f29185]"></div>

				<!-- Logo / Monogram -->
				<div class="flex justify-center mb-6">
					<div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0593C6] to-[#0477a1] text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-[#0593C6]/25">
						<span>A</span>
						<span class="w-2 h-2 rounded-full bg-[#D83995] ml-0.5 -mt-3"></span>
					</div>
				</div>

				<div class="text-center mb-8">
					<div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D83995]/10 text-[#D83995] text-xs font-bold mb-2">
						<Lock class="w-3.5 h-3.5" />
						Akses Khusus Admin
					</div>
					<h1 class="text-2xl font-black text-slate-900 tracking-tight">
						Masuk ke Studio Penulis
					</h1>
					<p class="text-xs text-slate-500 mt-1.5 leading-relaxed">
						Hanya Anda yang berhak mengakses dan menulis artikel baru.
					</p>
				</div>

				<!-- Error alert if login fails -->
				{#if form?.error}
					<div class="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2.5 animate-in fade-in duration-200">
						<AlertCircle class="w-4 h-4 text-red-500 shrink-0" />
						<span>{form.error}</span>
					</div>
				{/if}

				<!-- Login Form -->
				<form method="POST" action="?/login" class="space-y-5">
					<div>
						<label for="admin-user" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
							Username
						</label>
						<div class="relative">
							<div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
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
								class="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0593C6] focus:border-transparent transition"
							/>
						</div>
					</div>

					<div>
						<label for="admin-pass" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
							Password
						</label>
						<div class="relative">
							<div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
								<Lock class="w-4 h-4" />
							</div>
							<input
								id="admin-pass"
								name="password"
								type={showPassword ? 'text' : 'password'}
								required
								autocomplete="current-password"
								placeholder="••••••••••••"
								class="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0593C6] focus:border-transparent transition"
							/>
							<button
								type="button"
								onclick={() => showPassword = !showPassword}
								class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
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
						class="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#0593C6] to-[#0477a1] text-white font-bold text-sm hover:opacity-95 transition shadow-lg shadow-[#0593C6]/25 cursor-pointer flex items-center justify-center gap-2 mt-2"
					>
						<span>Buka Studio Penulis</span>
						<Shield class="w-4 h-4" />
					</button>
				</form>
			</div>
		</div>
	</div>
{:else}
	<!-- AUTHENTICATED WRITING STUDIO -->
	<div class="py-8 sm:py-12 bg-[#FCFFFF]">
		<div class="max-w-7xl mx-auto px-4 sm:px-6">
			<!-- Top Bar with Logout -->
			<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-200">
				<div>
					<div class="flex items-center gap-2 mb-2">
						<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D83995]/10 text-[#D83995] text-xs font-semibold">
							<PenTool class="w-3.5 h-3.5" />
							Studio Penulis (Aktif)
						</span>
						<span class="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
							<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
							Masuk sebagai adamin
						</span>
					</div>
					<h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
						Tulis & Publikasikan Pemikiran Anda
					</h1>
					<p class="text-xs sm:text-sm text-slate-500 mt-1">
						Ketik langsung di sini dengan format Markdown dan Live Preview real-time.
					</p>
				</div>

				<!-- Action Buttons Group + Logout -->
				<div class="flex flex-wrap items-center gap-2 sm:gap-3">
					<button
						onclick={copyToClipboard}
						class="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer shadow-xs"
						title="Salin seluruh isi Markdown ke clipboard"
					>
						{#if copied}
							<Check class="w-4 h-4 text-emerald-600" />
							<span class="text-emerald-600">Tersalin!</span>
						{:else}
							<Copy class="w-4 h-4 text-slate-500" />
							<span>Salin Markdown</span>
						{/if}
					</button>

					<button
						onclick={downloadMarkdownFile}
						class="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer shadow-xs"
						title="Unduh file .md"
					>
						<Download class="w-4 h-4 text-slate-500" />
						<span>Unduh .md</span>
					</button>

					<button
						onclick={savePostToProject}
						disabled={isSaving}
						class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0593C6] to-[#0477a1] text-white text-xs font-bold hover:opacity-95 transition cursor-pointer shadow-md shadow-[#0593C6]/20 disabled:opacity-50"
					>
						<Save class="w-4 h-4" />
						<span>{isSaving ? 'Menyimpan...' : 'Simpan ke Project (.md)'}</span>
					</button>

					<!-- Logout Form -->
					<form method="POST" action="?/logout" class="inline-block">
						<button
							type="submit"
							class="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-red-200 bg-red-50/60 hover:bg-red-100 text-red-700 text-xs font-semibold transition cursor-pointer"
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
				<div class="mb-6 p-4 rounded-xl flex items-start gap-3 text-sm animate-in fade-in duration-200 {saveMessage.type === 'success'
					? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
					: saveMessage.type === 'info'
					? 'bg-sky-50 border border-sky-200 text-sky-800'
					: 'bg-red-50 border border-red-200 text-red-800'}">
					{#if saveMessage.type === 'success'}
						<Check class="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
					{:else}
						<AlertCircle class="w-5 h-5 text-current shrink-0 mt-0.5" />
					{/if}
					<div class="flex-1 font-medium">{saveMessage.text}</div>
					<button onclick={() => saveMessage = null} class="text-xs font-bold opacity-60 hover:opacity-100">✕</button>
				</div>
			{/if}

			<!-- View Switcher on Small Screens -->
			<div class="flex items-center gap-2 mb-4 lg:hidden">
				<button
					onclick={() => activeTab = 'editor'}
					class="flex-1 py-2 text-xs font-semibold rounded-lg {activeTab === 'editor' ? 'bg-[#0593C6] text-white' : 'bg-slate-100 text-slate-700'}"
				>
					Editor Ketik
				</button>
				<button
					onclick={() => activeTab = 'preview'}
					class="flex-1 py-2 text-xs font-semibold rounded-lg {activeTab === 'preview' ? 'bg-[#0593C6] text-white' : 'bg-slate-100 text-slate-700'}"
				>
					Live Preview
				</button>
			</div>

			<!-- Main Two-Column Layout -->
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
				<!-- LEFT COLUMN: Editor Form -->
				<div class="space-y-5 bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm {activeTab === 'preview' ? 'hidden lg:block' : ''}">
					<div class="flex items-center justify-between">
						<h2 class="font-extrabold text-base text-slate-900 flex items-center gap-2">
							<FileText class="w-4 h-4 text-[#0593C6]" />
							Metadata & Tulisan
						</h2>
						<button onclick={resetForm} class="text-xs text-slate-400 hover:text-red-500 transition">
							Kosongkan Form
						</button>
					</div>

					<!-- Judul Input -->
					<div>
						<label for="post-title" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
							Judul Artikel *
						</label>
						<input
							id="post-title"
							type="text"
							bind:value={title}
							oninput={onTitleInput}
							placeholder="Contoh: Mengapa Uang Tunai Tetap Berharga di Saat Suku Bunga Tinggi"
							class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#0593C6] text-sm"
						/>
					</div>

					<!-- Slug & Category Row -->
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label for="post-slug" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
								Slug URL
							</label>
							<input
								id="post-slug"
								type="text"
								bind:value={slug}
								oninput={() => slugManuallyEdited = true}
								placeholder="mengapa-uang-tunai-berharga"
								class="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#0593C6]"
							/>
						</div>

						<div>
							<label for="post-category" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
								Kategori
							</label>
							<select
								id="post-category"
								bind:value={category}
								class="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0593C6] bg-white"
							>
								<option value="Investasi">Investasi</option>
								<option value="Mindset Keuangan">Mindset Keuangan</option>
								<option value="Opini Dunia">Opini Dunia</option>
								<option value="Geopolitik">Geopolitik</option>
								<option value="Refleksi Hidup">Refleksi Hidup</option>
								<option value="Analisis Pasar">Analisis Pasar</option>
							</select>
						</div>
					</div>

					<!-- Description / Excerpt -->
					<div>
						<label for="post-desc" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
							Ringkasan Singkat (Lead / Excerpt)
						</label>
						<textarea
							id="post-desc"
							bind:value={description}
							rows="2"
							placeholder="Satu atau dua kalimat yang merangkum pesan utama tulisan ini..."
							class="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0593C6] leading-relaxed"
						></textarea>
					</div>

					<!-- Tags & ReadTime Row -->
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label for="post-tags" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
								Tags (Pisahkan koma)
							</label>
							<input
								id="post-tags"
								type="text"
								bind:value={tags}
								placeholder="Investasi, Cashflow, Saham"
								class="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0593C6]"
							/>
						</div>
						<div>
							<label for="post-readtime" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
								Estimasi Waktu Baca
							</label>
							<input
								id="post-readtime"
								type="text"
								bind:value={readTime}
								placeholder="5 min baca"
								class="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0593C6]"
							/>
						</div>
					</div>

					<!-- Formatting Toolbar -->
					<div>
						<div class="flex items-center justify-between mb-2">
							<label for="markdown-editor" class="text-xs font-bold text-slate-700 uppercase tracking-wider">
								Isi Konten (Markdown)
							</label>
							<div class="text-[11px] text-slate-400">
								{content.length} karakter • {content.split(/\s+/).filter(Boolean).length} kata
							</div>
						</div>

						<div class="flex flex-wrap items-center gap-1 p-1.5 bg-slate-50 border border-slate-200 rounded-t-xl text-slate-600">
							<button type="button" onclick={() => insertFormatting('## ')} class="p-1.5 hover:bg-white hover:text-[#0593C6] rounded transition" title="Heading 2">
								<Heading2 class="w-4 h-4" />
							</button>
							<button type="button" onclick={() => insertFormatting('### ')} class="p-1.5 hover:bg-white hover:text-[#0593C6] rounded transition" title="Heading 3">
								<Heading3 class="w-4 h-4" />
							</button>
							<button type="button" onclick={() => insertFormatting('**', '**')} class="p-1.5 hover:bg-white hover:text-[#0593C6] rounded transition" title="Tebal (Bold)">
								<Bold class="w-4 h-4" />
							</button>
							<button type="button" onclick={() => insertFormatting('*', '*')} class="p-1.5 hover:bg-white hover:text-[#0593C6] rounded transition" title="Miring (Italic)">
								<Italic class="w-4 h-4" />
							</button>
							<button type="button" onclick={() => insertFormatting('> ')} class="p-1.5 hover:bg-white hover:text-[#D83995] rounded transition" title="Kutipan (Blockquote)">
								<Quote class="w-4 h-4" />
							</button>
							<button type="button" onclick={() => insertFormatting('* ')} class="p-1.5 hover:bg-white hover:text-[#0593C6] rounded transition" title="Daftar Poin">
								<List class="w-4 h-4" />
							</button>
							<button type="button" onclick={() => insertFormatting('```\n', '\n```')} class="p-1.5 hover:bg-white hover:text-[#0593C6] rounded transition" title="Code Block">
								<Code class="w-4 h-4" />
							</button>
							<button type="button" onclick={() => insertFormatting('\n| Aset | Alokasi | Alasan |\n|---|---|---|\n| Kas | 40% | Ketahanan likuiditas |\n')} class="p-1.5 hover:bg-white hover:text-[#0593C6] rounded transition" title="Tabel Keuangan">
								<Table class="w-4 h-4" />
							</button>
						</div>

						<textarea
							id="markdown-editor"
							bind:value={content}
							rows="16"
							placeholder="Mulai ketik cerita atau analisis Anda di sini..."
							class="w-full p-4 rounded-b-xl border border-t-0 border-slate-200 text-slate-800 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0593C6] leading-relaxed resize-y"
						></textarea>
					</div>
				</div>

				<!-- RIGHT COLUMN: Live Preview -->
				<div class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm sticky top-24 {activeTab === 'editor' ? 'hidden lg:block' : ''}">
					<div class="flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
						<div class="flex items-center gap-2">
							<Eye class="w-4 h-4 text-[#D83995]" />
							<span class="font-extrabold text-sm text-slate-900">Live Preview Pembaca</span>
						</div>
						<span class="text-xs px-2.5 py-0.5 rounded-full bg-[#0593C6]/10 text-[#0593C6] font-semibold">
							{category}
						</span>
					</div>

					<!-- Preview Title -->
					<h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight mb-3">
						{title || 'Judul Artikel Akan Muncul di Sini'}
					</h1>

					<!-- Preview Description -->
					{#if description}
						<p class="text-slate-600 text-sm leading-relaxed mb-4 font-medium italic">
							{description}
						</p>
					{/if}

					<!-- Preview Metadata Bar -->
					<div class="flex items-center gap-4 text-xs text-slate-400 pb-6 mb-6 border-b border-slate-100">
						<span>Adam Alhasni</span>
						<span>•</span>
						<div class="flex items-center gap-1">
							<Clock class="w-3.5 h-3.5 text-[#D83995]" />
							<span>{readTime}</span>
						</div>
						<span>•</span>
						<div class="flex items-center gap-1">
							<Calendar class="w-3.5 h-3.5 text-[#0593C6]" />
							<span>{new Date().toISOString().split('T')[0]}</span>
						</div>
					</div>

					<!-- Rendered Markdown Body -->
					<div class="preview-body prose prose-slate max-w-none text-slate-800 text-sm leading-relaxed
						prose-headings:text-slate-900 prose-headings:font-bold
						prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3 prose-h2:border-b prose-h2:border-slate-100 prose-h2:pb-1
						prose-h3:text-lg prose-h3:mt-5 prose-h3:mb-2 prose-h3:text-[#0593C6]
						prose-blockquote:border-l-4 prose-blockquote:border-[#D83995] prose-blockquote:bg-[#D83995]/5 prose-blockquote:p-3 prose-blockquote:rounded-r-lg prose-blockquote:italic
						prose-code:text-[#D83995] prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
						prose-table:border-collapse prose-th:bg-[#0593C6]/10 prose-th:p-2 prose-td:p-2 prose-td:border-b prose-td:border-slate-200">
						{@html renderedHtml}
					</div>
				</div>
			</div>

			<!-- Existing Posts Section in Admin -->
			<div class="mt-16 pt-10 border-t border-slate-200">
				<div class="flex items-center justify-between mb-6">
					<div class="flex items-center gap-2">
						<Layers class="w-5 h-5 text-[#0593C6]" />
						<h3 class="text-lg font-bold text-slate-900">Artikel yang Tersimpan di Project ({data.posts?.length || 0})</h3>
					</div>
					<a href="/artikel" class="text-xs font-semibold text-[#0593C6] hover:underline">
						Lihat halaman pembaca →
					</a>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					{#each (data.posts || []) as post}
						<div class="p-4 rounded-xl bg-white border border-slate-200 flex flex-col justify-between">
							<div>
								<div class="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
									<span class="text-[#0593C6] font-semibold">{post.metadata.category}</span>
									<span>{post.metadata.date}</span>
								</div>
								<h4 class="font-bold text-sm text-slate-800 line-clamp-2 mb-1">{post.metadata.title}</h4>
								<p class="text-xs text-slate-500 font-mono">src/posts/{post.slug}.md</p>
							</div>
							<div class="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
								<a href="/artikel/{post.slug}" target="_blank" class="text-[#0593C6] font-semibold hover:text-[#D83995]">
									Buka Artikel ↗
								</a>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
{/if}
