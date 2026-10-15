# Progresia

Progresia adalah aplikasi web untuk membantu mahasiswa mengelola tugas kelompok, mencatat progres berbasis bukti, dan mengevaluasi kontribusi anggota secara transparan dan adil.

## Fitur Utama

- **Autentikasi** — Registrasi, login, lupa kata sandi via Supabase Auth
- **Manajemen Kelompok** — Buat kelompok, gabung via kode undangan + PIN, reset PIN
- **Manajemen Tugas** — Buat tugas dengan penanggung jawab, prioritas, tenggat waktu, dan status
- **Pelaporan Progres** — Catat progres dengan bukti pekerjaan (upload file privat)
- **Evaluasi Kontribusi** — Penilaian antarangota skala 1–5 dengan kriteria jelas
- **Review Ketua** — Ketua dapat menyesuaikan nilai akhir dengan alasan wajib
- **Laporan** — Laporan kontribusi yang dapat dicetak atau diekspor ke PDF
- **Dashboard** — Ringkasan kelompok, tugas, statistik dengan grafik interaktif

## Tech Stack

| Kategori | Teknologi |
|---|---|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS 3 |
| Backend | Supabase (PostgreSQL, Auth, Storage) |
| Routing | React Router 7 |
| Form | React Hook Form + Zod |
| Ikon | lucide-react |
| Chart | Recharts |
| PDF | jsPDF + jsPDF autotable |
| Linter | oxlint |

## Instalasi & Menjalankan

### 1. Clone repository dan masuk ke folder proyek

```bash
git clone <repository-url>
cd progresia
```

### 2. Install dependency

```bash
npm install
```

### 3. Buat file `.env.local` di root proyek

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Jalankan development server

```bash
npm run dev
```

### 5. Buka URL lokal yang ditampilkan Vite di terminal

## Setup Database

1. Buat project baru di [Supabase](https://supabase.com)
2. Buka **SQL Editor** di Supabase Dashboard
3. Buka file `src/migration/MASTER_SETUP.sql`
4. Salin seluruh isi file ke SQL Editor
5. Jalankan script sampai selesai

Script `MASTER_SETUP.sql` bersifat **idempotent** (aman dijalankan ulang) dan berisi:
- Skema tabel lengkap (profiles, groups, group_members, tasks, progress_updates, progress_files, contribution_periods, contribution_votes, contribution_reviews)
- Tabel audit (score_audit_log, task_status_history)
- Index, trigger, RPC pendukung
- Row Level Security (RLS) policies untuk semua tabel
- Constraint skala penilaian 1-5
- Constraint single-leader per grup
- Storage bucket privat (`progress-files`, `avatars`) beserta policies-nya

## Script NPM

| Perintah | Deskripsi |
|---|---|
| `npm run dev` | Development server |
| `npm run lint` | Lint dengan oxlint |
| `npm run build` | Type check + production build |
| `npm run preview` | Preview production build |

## Keamanan

- **Row Level Security (RLS)** aktif di semua tabel
- **PIN** disimpan sebagai hash SHA-256 (tidak plaintext)
- **File** disimpan di bucket privat, akses via signed URLs
- **Evaluasi** hanya bisa dilakukan saat periode dibuka
- **Progress** append-only (tidak bisa diubah/dihapus)
- **Audit log** untuk semua perubahan nilai oleh ketua
- **Task status history** otomatis tercatat via trigger DB

## Keterbatasan yang Diketahui

1. **PIN hashing** menggunakan SHA-256 tanpa salt. Untuk production, disarankan migrasi ke bcrypt atau PBKDF2.
2. **Edit & hapus tugas** belum tersedia (hanya create).
3. **Midtrans Payment / Subscription** belum diimplementasikan (direncanakan di PLAN.md).
