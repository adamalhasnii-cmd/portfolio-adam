# Adam Alhasni — Blog Pemikiran & Investasi

Website personal berbasis **SvelteKit** dan **Markdown (MDsveX)** untuk membagikan pemikiran kritis tentang dunia, refleksi psikologi uang, dan strategi investasi yang tahan banting.

---

## 🎨 Palet Warna Tema

Sesuai permintaan Anda, tema website dirancang khusus menggunakan palet berikut:
* **Warna Utama (Sky Blue):** `#0593C6` — Digunakan untuk header, link, tombol utama, dan aksen navigasi.
* **Warna Latar / Kontras Bersih (White):** `#FCFFFF` — Warna latar belakang kanvas agar pembacaan esai panjang terasa nyaman di mata.
* **Warna Kontras / Aksen Kuat (Hot Pink):** `#D83995` — Digunakan untuk kutipan (*blockquote*), tanda bintang sorotan, seleksi teks, dan penanda penting.
* **Warna Aksen Tambahan (Soft Coral):** `#f29185` — Digunakan untuk kartu pilar ketiga, badge, dan gradasi aksen.

---

## 🚀 Fitur Utama

1. **100% Gratis Selamanya (MDsveX):**
   * Semua tulisan disimpan sebagai file Markdown (`.md`) di dalam folder `src/posts/`.
   * Tanpa biaya database bulanan, tanpa batasan kuota.
   * Sangat cepat karena dioptimalkan secara otomatis oleh SvelteKit.
2. **Mode Tulis / Admin Studio (`/admin`):**
   * Anda bisa mengetik langsung dari browser tanpa membuka file teks manual.
   * Dilengkapi **Live Preview** real-time bersisian (*side-by-side*).
   * **Simpan Otomatis ke Project:** Saat dijalankan di laptop (`npm run dev`), tombol *Simpan ke Project* akan langsung membuatkan file `.md` baru di folder `src/posts/`.
   * Dilengkapi tombol **Salin Markdown** dan **Unduh .md**.
3. **Desain Editorial Finansial Elegan:**
   * Filter kategori (Investasi, Mindset Keuangan, Opini Dunia, dll.).
   * Pencarian artikel seketika (*instant search*).
   * Tampilan detail bacaan dengan perkiraan waktu baca (*reading time*), disclaimer risiko, dan tombol bagikan (*share*).
4. **Siap Deploy ke Vercel:**
   * Terkonfigurasi langsung dengan `@sveltejs/adapter-vercel`.

---

## 💻 Cara Menjalankan di Laptop

1. Jalankan server lokal:
   ```bash
   npm run dev
   ```
2. Buka browser di [http://localhost:5173](http://localhost:5173).
3. Buka halaman admin untuk menulis di [http://localhost:5173/admin](http://localhost:5173/admin).

---

## 🌐 Cara Deploy ke Vercel (Gratis 100%)

1. Buat repository baru di akun **GitHub** Anda (misalnya `blog-adam`).
2. Hubungkan folder ini ke GitHub:
   ```bash
   git remote add origin https://github.com/USERNAME-ANDA/NAMA-REPO.git
   git branch -M main
   git push -u origin main
   ```
3. Buka [vercel.com](https://vercel.com) lalu login dengan akun GitHub Anda.
4. Klik **"Add New Project"** > pilih repository yang baru Anda push.
5. Vercel akan otomatis mendeteksi **SvelteKit** dan melakukan build. Klik **"Deploy"**.
6. Selesai! Website Anda langsung tayang dengan domain gratis (contoh: `adam-alhasni.vercel.app`) atau domain pribadi Anda.
