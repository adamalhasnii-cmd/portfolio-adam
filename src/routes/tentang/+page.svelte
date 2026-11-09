<script lang="ts">
	import { User, Compass, Target, Shield, HeartHandshake, ArrowRight } from '@lucide/svelte';
</script>

<svelte:head>
	<title>Tentang Penulis & Filosofi — 911</title>
	<meta
		name="description"
		content="Mengenal 911, motivasi di balik penulisan esai, dan filosofi dasar tentang uang, investasi, serta otonomi hidup."
	/>
</svelte:head>

<div class="py-10 sm:py-16 text-[#061a2e] dark:text-white">
	<div class="max-w-4xl mx-auto px-4 sm:px-6">
		<!-- Profile Header Card (Liquid Glass) -->
		<div
			class="glass-panel rounded-3xl p-8 sm:p-12 mb-10 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-center sm:items-start gap-8 border border-sky-200/60 dark:border-white/20"
		>
			<!-- Ambient glow behind avatar -->
			<div
				class="absolute -top-10 -left-10 w-48 h-48 rounded-full bg-[#D83995]/20 dark:bg-[#D83995]/30 blur-2xl pointer-events-none"
			></div>

			<!-- Monogram Avatar -->
			<div class="relative shrink-0">
				<div
					class="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-[#0593C6] text-white dark:bg-white/20 dark:border dark:border-white/30 flex items-center justify-center font-black text-4xl shadow-xl backdrop-blur-md"
				>
					911
				</div>
				<div
					class="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-[#D83995] text-xs font-bold text-white shadow-md flex items-center gap-1.5"
				>
					<span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
					Penulis
				</div>
			</div>

			<div class="text-center sm:text-left space-y-3 flex-1 relative z-10">
				<div
					class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-pill text-[#0593C6] dark:text-white text-xs font-bold uppercase tracking-wider"
				>
					Profil Penulis
				</div>
				<h1 class="text-3xl sm:text-5xl font-black text-[#061a2e] dark:text-white tracking-tight drop-shadow-xs">
					911
				</h1>
				<p class="text-base sm:text-lg text-[#2e4a68] dark:text-sky-50/90 leading-relaxed font-normal">
					Pengamat dinamika pasar, pemikir independen, dan praktisi yang percaya bahwa uang adalah
					instrumen untuk membeli kendali atas waktu, bukan sekadar simbol status semu.
				</p>
			</div>
		</div>

		<!-- The "Why" Story (Glass Card) -->
		<div class="glass-panel rounded-3xl p-8 sm:p-12 mb-10 shadow-xl space-y-6 border border-sky-200/60 dark:border-white/20">
			<h2 class="text-2xl sm:text-3xl font-black text-[#061a2e] dark:text-white tracking-tight">
				Mengapa Website Ini Dibuat?
			</h2>
			<div class="prose prose-lg dark:prose-invert text-[#243d57] dark:text-sky-50/90 leading-relaxed space-y-4">
				<p>
					Dunia modern dipenuhi oleh kebisingan yang luar biasa. Setiap hari kita dibombardir oleh
					prediksi pasar saham, tren kripto terbaru, saran karier dari orang-orang yang tidak
					menanggung risiko hidup kita, dan ilusi bahwa kesuksesan harus terjadi sebelum usia tiga
					puluh tahun.
				</p>
				<p>
					Website ini lahir sebagai ruang kontemplasi. Tempat saya mencatat pengamatan jujur tentang
					bagaimana dunia sebenarnya berputar, bagaimana psikologi manusia memengaruhi pasar modal,
					dan langkah nyata apa yang harus kita ambil ketika ketidakpastian ekonomi datang.
				</p>
				<blockquote
					class="border-l-4 border-[#D83995] bg-[#D83995]/8 dark:bg-white/10 p-5 rounded-r-2xl italic text-[#183049] dark:text-white font-medium my-6"
				>
					"Tujuan akhir dari kecerdasan finansial bukanlah memiliki mobil paling mengkilap di lampu
					merah, melainkan bisa tidur nyenyak di malam hari tanpa rasa cemas akan hari esok."
				</blockquote>
			</div>
		</div>

		<!-- Four Principles Grid (Glass Cards) -->
		<div class="mb-10">
			<h2 class="text-2xl sm:text-3xl font-black text-[#061a2e] dark:text-white tracking-tight mb-8">
				Empat Pilar yang Saya Pegang
			</h2>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
				<div
					class="p-7 rounded-3xl glass-panel hover:border-[#0593C6]/40 dark:hover:border-white/40 transition-all shadow-lg text-[#061a2e] dark:text-white"
				>
					<div
						class="w-10 h-10 rounded-2xl bg-[#0593C6]/15 dark:bg-white/20 flex items-center justify-center text-[#0593C6] dark:text-white mb-4"
					>
						<Target class="w-5 h-5" />
					</div>
					<h3 class="font-bold text-lg text-[#061a2e] dark:text-white mb-2">1. Otonomi Waktu</h3>
					<p class="text-sm text-[#3b5877] dark:text-sky-50/85 leading-relaxed font-normal">
						Uang bernilai tinggi ketika ia memberi Anda kemampuan untuk memilih: pekerjaan apa yang
						ingin diambil, dengan siapa Anda ingin menghabiskan hari, dan kapan Anda ingin
						beristirahat.
					</p>
				</div>

				<div
					class="p-7 rounded-3xl glass-panel hover:border-[#0593C6]/40 dark:hover:border-white/40 transition-all shadow-lg text-[#061a2e] dark:text-white"
				>
					<div
						class="w-10 h-10 rounded-2xl bg-[#D83995]/15 dark:bg-[#D83995]/50 flex items-center justify-center text-[#D83995] dark:text-white mb-4"
					>
						<Shield class="w-5 h-5" />
					</div>
					<h3 class="font-bold text-lg text-[#061a2e] dark:text-white mb-2">2. Seni Bertahan Hidup</h3>
					<p class="text-sm text-[#3b5877] dark:text-sky-50/85 leading-relaxed font-normal">
						Imbal hasil rata-rata yang konsisten selama beberapa dekade selalu mengalahkan imbal
						hasil fantastis yang berakhir dengan kebangkrutan total akibat leverage berlebih.
					</p>
				</div>

				<div
					class="p-7 rounded-3xl glass-panel hover:border-[#0593C6]/40 dark:hover:border-white/40 transition-all shadow-lg text-[#061a2e] dark:text-white"
				>
					<div
						class="w-10 h-10 rounded-2xl bg-[#0593C6]/15 dark:bg-white/20 flex items-center justify-center text-[#0593C6] dark:text-white mb-4"
					>
						<Compass class="w-5 h-5" />
					</div>
					<h3 class="font-bold text-lg text-[#061a2e] dark:text-white mb-2">3. Rasionalitas vs. Emosi</h3>
					<p class="text-sm text-[#3b5877] dark:text-sky-50/85 leading-relaxed font-normal">
						Mengelola keuangan adalah 80% perilaku emosi dan 20% rumus matematika. Jika emosi serakah
						dan takut tidak dijinakkan, kalkulasi canggih apa pun tidak akan menyelamatkan kita.
					</p>
				</div>

				<div
					class="p-7 rounded-3xl glass-panel hover:border-[#0593C6]/40 dark:hover:border-white/40 transition-all shadow-lg text-[#061a2e] dark:text-white"
				>
					<div
						class="w-10 h-10 rounded-2xl bg-[#0593C6]/15 dark:bg-white/20 flex items-center justify-center text-[#0593C6] dark:text-white mb-4"
					>
						<HeartHandshake class="w-5 h-5" />
					</div>
					<h3 class="font-bold text-lg text-[#061a2e] dark:text-white mb-2">4. Nilai Riil & Kejujuran</h3>
					<p class="text-sm text-[#3b5877] dark:text-sky-50/85 leading-relaxed font-normal">
						Hanya berinvestasi pada hal-hal yang benar-benar kita pahami dan memberikan solusi nyata
						bagi manusia, bukan sekadar menunggangi gelombang spekulasi tanpa substansi.
					</p>
				</div>
			</div>
		</div>

		<!-- Action Footer -->
		<div
			class="glass-panel rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-sky-200/60 dark:border-white/20"
		>
			<div>
				<h3 class="font-black text-xl text-[#061a2e] dark:text-white">Ingin membaca esai terbaru saya?</h3>
				<p class="text-sm text-[#3b5877] dark:text-sky-100/80 mt-1">
					Jelajahi kumpulan pemikiran yang telah saya terbitkan.
				</p>
			</div>
			<div>
				<a
					href="/artikel"
					class="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#0593C6] text-white hover:bg-[#047ea8] dark:bg-white dark:text-[#0593C6] text-sm font-bold shadow-xl shadow-[#0593C6]/25 dark:shadow-black/10 hover:scale-[1.02] active:scale-95 transition cursor-pointer"
				>
					<span>Mulai Membaca</span>
					<ArrowRight class="w-4 h-4" />
				</a>
			</div>
		</div>
	</div>
</div>
