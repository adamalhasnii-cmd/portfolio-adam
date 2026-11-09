<script lang="ts">
	import { User, Compass, Target, Shield, HeartHandshake, PenTool, ArrowRight, Mail } from '@lucide/svelte';
</script>

<svelte:head>
	<title>Tentang Penulis & Filosofi — Adam Alhasni</title>
	<meta name="description" content="Mengenal Adam Alhasni, motivasi di balik penulisan esai, dan filosofi dasar tentang uang, investasi, serta otonomi hidup." />
</svelte:head>

<div class="py-12 sm:py-20 bg-[#FCFFFF]">
	<div class="max-w-4xl mx-auto px-4 sm:px-6">
		<!-- Profile Header -->
		<div class="flex flex-col sm:flex-row items-center sm:items-start gap-8 pb-12 border-b border-slate-200">
			<!-- Monogram Avatar -->
			<div class="relative">
				<div class="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-[#0593C6] via-[#0593C6] to-[#D83995] text-white flex items-center justify-center font-black text-4xl shadow-xl shadow-[#0593C6]/20">
					AA
				</div>
				<div class="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-white text-xs font-bold text-[#D83995] shadow-md border border-slate-100 flex items-center gap-1">
					<span class="w-2 h-2 rounded-full bg-[#D83995]"></span>
					Penulis
				</div>
			</div>

			<div class="text-center sm:text-left space-y-3 flex-1">
				<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0593C6]/10 text-[#0593C6] text-xs font-semibold">
					Tentang Penulis
				</div>
				<h1 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
					Adam Alhasni
				</h1>
				<p class="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
					Pengamat dinamika pasar, pemikir independen, dan praktisi yang percaya bahwa uang adalah instrumen untuk membeli kendali atas waktu, bukan sekadar simbol status.
				</p>
			</div>
		</div>

		<!-- The "Why" Story -->
		<div class="py-12 border-b border-slate-200 space-y-6">
			<h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
				Mengapa Website Ini Dibuat?
			</h2>
			<div class="prose prose-lg text-slate-700 leading-relaxed space-y-4">
				<p>
					Dunia modern dipenuhi oleh kebisingan yang luar biasa. Setiap hari kita dibombardir oleh prediksi pasar saham, tren kripto terbaru, saran karier dari orang-orang yang tidak menanggung risiko hidup kita, dan ilusi bahwa kesuksesan harus terjadi sebelum usia tiga puluh tahun.
				</p>
				<p>
					Website ini lahir sebagai ruang kontemplasi. Tempat saya mencatat pengamatan jujur tentang bagaimana dunia sebenarnya berputar, bagaimana psikologi manusia memengaruhi pasar modal, dan langkah nyata apa yang harus kita ambil ketika ketidakpastian ekonomi datang.
				</p>
				<blockquote class="border-l-4 border-[#D83995] bg-[#D83995]/5 p-4 rounded-r-lg italic text-slate-800 font-medium">
					"Tujuan akhir dari kecerdasan finansial bukanlah memiliki mobil paling mengkilap di lampu merah, melainkan bisa tidur nyenyak di malam hari tanpa rasa cemas akan hari esok."
				</blockquote>
			</div>
		</div>

		<!-- Four Principles Grid -->
		<div class="py-12 border-b border-slate-200">
			<h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-8">
				Empat Pilar yang Saya Pegang
			</h2>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
				<div class="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
					<div class="w-10 h-10 rounded-xl bg-[#0593C6]/10 text-[#0593C6] flex items-center justify-center mb-4">
						<Target class="w-5 h-5" />
					</div>
					<h3 class="font-bold text-lg text-slate-900 mb-2">1. Otonomi Waktu</h3>
					<p class="text-sm text-slate-600 leading-relaxed">
						Uang bernilai tinggi ketika ia memberi Anda kemampuan untuk memilih: pekerjaan apa yang ingin diambil, dengan siapa Anda ingin menghabiskan hari, dan kapan Anda ingin beristirahat.
					</p>
				</div>

				<div class="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
					<div class="w-10 h-10 rounded-xl bg-[#D83995]/10 text-[#D83995] flex items-center justify-center mb-4">
						<Shield class="w-5 h-5" />
					</div>
					<h3 class="font-bold text-lg text-slate-900 mb-2">2. Seni Bertahan Hidup</h3>
					<p class="text-sm text-slate-600 leading-relaxed">
						Imbal hasil rata-rata yang konsisten selama beberapa dekade selalu mengalahkan imbal hasil fantastis yang berakhir dengan kebangkrutan total akibat leverage berlebih.
					</p>
				</div>

				<div class="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
					<div class="w-10 h-10 rounded-xl bg-[#f29185]/20 text-[#d96c5e] flex items-center justify-center mb-4">
						<Compass class="w-5 h-5" />
					</div>
					<h3 class="font-bold text-lg text-slate-900 mb-2">3. Rasionalitas vs. Emosi</h3>
					<p class="text-sm text-slate-600 leading-relaxed">
						Mengelola keuangan adalah 80% perilaku emosi dan 20% rumus matematika. Jika emosi serakah dan takut tidak dijinakkan, kalkulasi canggih apa pun tidak akan menyelamatkan kita.
					</p>
				</div>

				<div class="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
					<div class="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center mb-4">
						<HeartHandshake class="w-5 h-5" />
					</div>
					<h3 class="font-bold text-lg text-slate-900 mb-2">4. Nilai Riil & Kejujuran</h3>
					<p class="text-sm text-slate-600 leading-relaxed">
						Hanya berinvestasi pada hal-hal yang benar-benar kita pahami dan memberikan solusi nyata bagi manusia, bukan sekadar menunggangi gelombang spekulasi tanpa substansi.
					</p>
				</div>
			</div>
		</div>

		<!-- Action Footer -->
		<div class="pt-12 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
			<div>
				<h3 class="font-extrabold text-lg text-slate-900">Ingin membaca pandangan terbaru saya?</h3>
				<p class="text-sm text-slate-500">Jelajahi kumpulan esai yang telah saya terbitkan.</p>
			</div>
			<div class="flex items-center gap-3">
				<a
					href="/artikel"
					class="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0593C6] text-white text-sm font-semibold hover:bg-[#0477a1] transition shadow-md shadow-[#0593C6]/20"
				>
					<span>Mulai Membaca</span>
					<ArrowRight class="w-4 h-4" />
				</a>
			</div>
		</div>
	</div>
</div>
