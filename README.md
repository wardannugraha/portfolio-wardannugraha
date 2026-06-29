# Portofolio Digital Wardan Nugraha Ahmad

Selamat datang di repositori portofolio digital **Wardan Nugraha Ahmad**. Website ini dirancang sebagai representasi profesional yang menggabungkan keahlian di bidang **Teknologi Rekayasa Perangkat Lunak** (*Builder*) dan **Produksi Media Kreatif** (*Creator*), serta reputasi kepemimpinan di tingkat regional dan akademik (*Learner* & *Contributor*).

Website ini dibangun menggunakan **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4**, dan **Prisma ORM** yang diintegrasikan langsung dengan basis data **Neon PostgreSQL (Serverless)**.

---

## 🌟 Konsep & Fitur Interaktif Premium

Website ini mengedepankan estetika gelap modern (*modern dark mode*) dengan elemen interaksi mikro kelas atas untuk memberikan kesan pertama (*wow factor*) yang mengesankan bagi rekruter dan klien:

### 1. Hero Spotlight Grid Reveal
* **Gaya Visual**: Latar belakang bagian atas (*Hero fold*) dilapisi oleh pola garis grid tipis khas web modern (Linear/Vercel style).
* **Interaksi**: Garis grid ini **hanya akan menyala terang di area sekitar kursor mouse** menggunakan efek *radial gradient mask*.
* **File Referensi**: [components/Hero.tsx](file:///d:/Coding/portfolio-wardannugraha/components/Hero.tsx) & [app/globals.css](file:///d:/Coding/portfolio-wardannugraha/app/globals.css).

### 2. 3D Perspective Bento Card Tilt + Glare
* **Gaya Visual**: Membagi profil Anda menjadi 4 pilar identitas (*Builder, Creator, Learner, Contributor*).
* **Interaksi**: Kartu-kartu ini merespons gerakan kursor mouse dengan kemiringan rotasi 3D dinamis (*tilt*) dan pantulan berkas cahaya (*radial glare reflective effect*) yang bergerak mengikuti posisi kursor.
* **File Referensi**: [components/Hero.tsx](file:///d:/Coding/portfolio-wardannugraha/components/Hero.tsx).

### 3. Magnetic CTA Buttons
* **Gaya Visual**: Tombol aksi utama "Explore My Work".
* **Interaksi**: Tombol ini memiliki gaya gravitasi magnetis yang secara halus bergeser mendekati kursor mouse jika kursor berada dalam radius 80 piksel dari tombol tersebut, memanfaatkan interpolasi fisika pegas (*spring physics*).
* **File Referensi**: [components/Hero.tsx](file:///d:/Coding/portfolio-wardannugraha/components/Hero.tsx).

### 4. Creative Media Flex Accordion Gallery
* **Gaya Visual**: Menampilkan karya fotografi, videografi, dan desain grafis Anda.
* **Teknik/Efek**: Menggunakan teknik **Flexbox Accordion** horizontal pada desktop. 
  - Secara default, kartu memiliki lebar asimetris acak (*irregular weights*) yang estetik.
  - Saat di-hover, kartu yang aktif akan melebar secara elastis berkecepatan 600ms (`cubic-bezier(0.16, 1, 0.3, 1)`) sementara kartu lain di baris yang sama menyusut secara sinkron. Hal ini mencegah perpindahan baris baru/loncatan tata letak (*layout shift*).
  - Video otomatis terputar tanpa suara (*silent loop*) saat di-hover dan berhenti ketika kursor keluar.
* **Optimasi Mobile**: Bertransformasi secara otomatis menjadi **Grid 2-Kolom Statis** dengan rasio kartu `4/3` agar gambar tetap berukuran sedang, rapi, dan mudah disentuh jari.
* **File Referensi**: [components/PhotographyShowcase.tsx](file:///d:/Coding/portfolio-wardannugraha/components/PhotographyShowcase.tsx).

### 5. Ambient Cursor Glow & Custom Pointer
* **Ambient Glow**: Efek pancaran cahaya ambient berwarna ungu-biru lembut di belakang teks utama yang mengikuti pergerakan kursor mouse secara presisi namun hemat memori.
* **Custom Pointer (Kursor Trailing)**: Menggantikan kursor bawaan browser dengan sebuah titik pusat presisi (`dot`) dan lingkaran luar (`ring`) yang mengikutinya dengan efek trailing halus.
  - Saat melintasi elemen interaktif (tombol, link, input), lingkaran luar membesar secara elastis dan terisi warna semi-transparan.
  - Saat mouse diklik, kursor merespons dengan sedikit efek mengerut/menyusut (*tactile visual click feedback*).
  - Dilengkapi filter warna `mix-blend-difference` sehingga warna kursor secara dinamis menyesuaikan kontras secara otomatis di atas latar belakang (menjadi putih pada area gelap, dan hitam pada area terang).
* **File Referensi**: [components/CursorGlow.tsx](file:///d:/Coding/portfolio-wardannugraha/components/CursorGlow.tsx) & [components/CustomCursor.tsx](file:///d:/Coding/portfolio-wardannugraha/components/CustomCursor.tsx).

---

## 🛠️ Stack Teknologi & Arsitektur Proyek

* **Frontend Framework**: Next.js 16 (App Router, Turbopack)
* **Bahasa**: TypeScript
* **Styling**: Tailwind CSS v4 & Vanilla CSS transition
* **Database & ORM**: PostgreSQL (Hosted on Neon DB) & Prisma ORM
* **Library Animasi**: Framer Motion & Lucide Icons
* **Media Handling**:
  - Penyimpanan file lokal di direktori `/public/uploads/`
  - URL media dipetakan dinamis di database PostgreSQL.

### Skema Database (Prisma Schema)
Model data yang digunakan mencakup:
* `User`: Kredensial masuk dasbor admin (Username & Password terenkripsi).
* `Category`: Manajemen kategori relasional untuk Proyek dan Media Galeri.
* `Project`: Menyimpan judul proyek, deskripsi, teknologi, tautan GitHub/Demo, serta URL gambar utama.
* `Media`: Menyimpan karya galeri foto/video, deskripsi, dan relasi kategori.
* `Skill`: Daftar keahlian yang dipisahkan berdasarkan kategori *Technology* dan *Creative*.
* `CommunityActivity`: Catatan organisasi sosial & prestasi kepemimpinan seperti **Duta Baca Jawa Barat & Cianjur**, serta kompetisi debat hukum.
* `Achievement`: Pendidikan formal dan sertifikasi profesi Next.js.

---

## 📂 Struktur Penting Repositori

```bash
portfolio-wardannugraha/
├── app/
│   ├── api/
│   │   ├── admin/
│   │   │   ├── login/route.ts      # Verifikasi kredensial dasbor & set HttpOnly cookie
│   │   │   ├── logout/route.ts     # Menghapus token otentikasi admin
│   │   │   ├── media/route.ts      # API CRUD data media galeri
│   │   │   ├── projects/route.ts   # API CRUD data proyek portfolio
│   │   │   └── upload/route.ts     # Penanganan unggah berkas (binary file uploads) ke lokal
│   ├── admin/                      # Halaman panel kelola data portfolio & upload
│   └── page.tsx                    # Halaman beranda utama (fetching database dynamic on server)
├── components/
│   ├── admin/                      # Komponen antarmuka dashboard admin
│   ├── CommunityImpact.tsx         # Bagian prestasi kepemimpinan & organisasi
│   ├── CursorGlow.tsx              # Efek ambient light kursor mouse
│   ├── Hero.tsx                    # Spotlight grid, 3D tilt cards, magnetic button
│   ├── Navbar.tsx                  # Navigasi dengan dropdown kategori dan smooth scroll
│   ├── PhotographyShowcase.tsx     # Galeri akordeon flexbox premium & lightbox video
│   ├── ProjectShowcase.tsx         # Tampilan grid proyek filterable 4-kolom
│   └── SkillsGrid.tsx              # Indikator keahlian pengkodean dan desain
├── lib/
│   └── prisma.ts                   # Koneksi Prisma Client dengan dukungan adapter PG Pool Neon
├── prisma/
│   ├── schema.prisma               # Definisi skema tabel database
│   └── seed.ts                     # Skrip pengisi data awal (seeder 14 media & proyek)
├── public/
│   └── uploads/                    # Tempat penyimpanan fisik file gambar/video yang diunggah
└── .env                            # Konfigurasi variabel lingkungan (lokal)
```

---

## 🚀 Panduan Menjalankan di Komputer Lokal

Jika obrolan atau riwayat chat Anda hilang, berikut adalah langkah-langkah untuk menyiapkan dan menjalankan kembali proyek ini dari awal:

### 1. Pemasangan Dependensi
Pastikan Anda memiliki Node.js terinstal, lalu jalankan perintah berikut di folder proyek untuk mengunduh semua modul dependensi:
```bash
npm install
```

### 2. Konfigurasi Variabel Lingkungan (`.env`)
Buat berkas bernama `.env` di direktori utama proyek Anda, lalu isi dengan format seperti berikut:
```env
# Koneksi database PostgreSQL Neon
DATABASE_URL="postgresql://username:password@ep-host-pooler.neon.tech/dbname?sslmode=require"

# NextAuth otentikasi kunci acak (opsional)
NEXTAUTH_SECRET="buat-kunci-rahasia-acak-di-sini-bebas"
NEXTAUTH_URL="http://localhost:3000"

# Akun Masuk Panel Admin (/admin)
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="masukkan-password-pilihan-anda"
```

### 3. Migrasi & Seeding Database
Jalankan perintah berikut untuk menyinkronkan skema tabel database ke Neon DB dan mengisi data sampel (6 foto, 4 video loop, 4 grafik desain, 3 proyek, dan keahlian):
```bash
# Sinkronisasi skema prisma ke database
npx prisma db push

# Menjalankan seeder untuk mengisi data awal
npx prisma db seed
```

### 4. Menjalankan Server Pengembangan
Jalankan server lokal dengan perintah berikut:
```bash
npm run dev
```
Buka peramban (browser) Anda di alamat [http://localhost:3000](http://localhost:3000).

---

## 🛠️ Cara Mengelola Konten Portofolio (Unggah Foto & Proyek)

1. Buka alamat [http://localhost:3000/admin](http://localhost:3000/admin).
2. Masuk menggunakan **ADMIN_USERNAME** dan **ADMIN_PASSWORD** yang telah Anda tentukan di file `.env`.
3. Anda akan diarahkan ke Dashboard Pengelolaan Konten:
   * **Project Form**: Tambahkan judul, deskripsi, teknologi, link GitHub, link Live Demo, serta **unggah berkas foto utama** proyek. Berkas akan otomatis disimpan ke `/public/uploads/` dan tercatat di database.
   * **Media Form**: Tambahkan judul karya visual, deskripsi singkat, pilih kategorinya (Photography, Videography, atau Graphic Design), dan **unggah berkas foto/video** karya Anda.
   * **Daftar Konten**: Anda dapat melihat tabel daftar konten aktif dan menghapusnya secara langsung (*instant deletion*) melalui tombol hapus yang disediakan.

---

## ☁️ Catatan untuk Deployment (Penyebaran ke Server)

Saat Anda memutuskan untuk menyebarkan portofolio ini ke layanan seperti **Vercel** atau **Netlify**:
1. **Database PostgreSQL**: Neon PostgreSQL bersifat serverless dan gratis, sangat cocok dihubungkan langsung ke Vercel dengan memasukkan variabel lingkungan `DATABASE_URL` pada dashboard konfigurasi Vercel Anda.
2. **Unggah File Lokal**: 
   * Karena server Vercel bersifat *serverless/read-only* setelah proses build (tidak mempertahankan berkas baru yang diunggah secara lokal setelah dideploy), unggahan foto baru melalui panel admin di masa mendatang direkomendasikan untuk dialihkan ke layanan penyimpanan cloud gratis/murah seperti **Vercel Blob**, **Cloudinary**, atau **Supabase Storage**.
   * Jika saat ini Anda memilih menggunakan penyimpanan lokal, pastikan seluruh file foto utama di `/public/uploads/` telah dicatat/masuk ke dalam repositori git Anda sebelum melakukan deploy ke Vercel agar file-file tersebut ikut terbawa saat proses build awal.
"# portfolio-wardannugraha" 
