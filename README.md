# Progresia

Progresia adalah aplikasi web untuk membantu mahasiswa mengelola tugas kelompok, mencatat progres berbasis bukti, dan mengevaluasi kontribusi anggota secara transparan.

## Fitur Utama

- Autentikasi pengguna dengan Supabase Auth.
- Manajemen kelompok dengan kode undangan dan PIN.
- Dashboard ringkasan kelompok, tugas, dan status pengerjaan.
- Pembuatan tugas dengan penanggung jawab, prioritas, tenggat waktu, dan status.
- Riwayat progres tugas dengan upload bukti pekerjaan.
- Evaluasi kontribusi antarangota per periode.
- Review dan penyesuaian nilai akhir oleh ketua kelompok.
- Laporan kontribusi yang dapat dicetak atau diekspor ke PDF.

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Supabase

## Instalasi & Menjalankan

1. Clone repository dan masuk ke folder proyek.

   ```bash
   git clone <repository-url>
   cd progresia
   ```

2. Install dependency.

   ```bash
   npm install
   ```

3. Buat file `.env.local` di root proyek, lalu isi kredensial Supabase.

   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Jalankan development server.

   ```bash
   npm run dev
   ```

5. Buka URL lokal yang ditampilkan Vite di terminal.

## Setup Database

1. Buat project baru di Supabase atau gunakan project yang sudah ada.
2. Buka Supabase Dashboard, masuk ke menu **SQL Editor**.
3. Buka file `MASTER_SETUP.sql` di root proyek ini.
4. Salin seluruh isi file tersebut ke SQL Editor Supabase.
5. Jalankan script sampai selesai.

Script `MASTER_SETUP.sql` berisi skema tabel, index, trigger, RPC pendukung, Row Level Security policies, dan bucket storage `progress-files`. Script dibuat idempotent dengan `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, dan `DROP POLICY IF EXISTS`, sehingga aman dijalankan ulang.

## Script NPM

```bash
npm run dev
npm run lint
npm run build
```
