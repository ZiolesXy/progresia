# PROJECT_CONTEXT.md

## Deskripsi Proyek

**Progresia** adalah aplikasi web untuk membantu mahasiswa mengelola tugas kelompok, mencatat progres berbasis bukti, dan mengevaluasi kontribusi anggota secara transparan.

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

## Cara Menjalankan

```bash
npm install        # install dependency
npm run dev        # development server
npm run lint       # lint dengan oxlint
npm run build      # type check + production build
npm run preview    # preview production build
```

### Environment Variables

Buat file `.env.local` di root proyek:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Setup Database

1. Buat project baru di [Supabase](https://supabase.com).
2. Buka **SQL Editor** di Supabase Dashboard.
3. Salin seluruh isi `src/migration/MASTER_SETUP.sql` ke SQL Editor.
4. Jalankan script sampai selesai.

Script `MASTER_SETUP.sql` bersifat **idempotent** (aman dijalankan ulang) dan berisi:
- Skema tabel, index, dan trigger
- Fungsi RPC pendukung (`is_group_member`, `is_group_leader`, `validate_invite_and_pin`)
- Row Level Security (RLS) policies untuk semua tabel
- Bucket storage `progress-files` beserta policies-nya

## Struktur Folder

```
src/
├── components/
│   ├── layout/          # Layout, Navbar
│   ├── ui/              # Komponen UI generik (Card, Button, Badge, EmptyState)
│   ├── ProtectedRoute.tsx
│   ├── CreateGroupModal.tsx
│   ├── JoinGroupModal.tsx
│   ├── CreateTaskModal.tsx
│   ├── AddProgressModal.tsx
│   ├── UpdateStatusModal.tsx
│   └── ResetPinModal.tsx
├── contexts/
│   └── AuthContext.tsx  # Auth state (user, session, signOut)
├── hooks/
│   ├── useGroups.ts     # Fetch kelompok user
│   └── useTasks.ts      # Fetch tugas per kelompok
├── lib/
│   └── supabase/
│       ├── client.ts    # Instance Supabase client
│       └── types.ts     # Database types
├── pages/
│   ├── HomePage.tsx         # Dashboard ringkasan
│   ├── GroupsPage.tsx       # Daftar kelompok
│   ├── GroupDetailPage.tsx  # Detail kelompok
│   ├── TasksPage.tsx        # Daftar tugas per kelompok
│   ├── TaskDetailPage.tsx   # Detail tugas + progres
│   ├── EvaluationPage.tsx   # Evaluasi kontribusi
│   ├── ReportPage.tsx       # Laporan kontribusi (PDF)
│   ├── LoginPage.tsx
│   └── RegisterPage.tsx
├── utils/
│   └── hash.ts          # Utility hashing (PIN)
├── App.tsx              # Router setup
└── main.tsx             # Entry point
```

## Routing

| Path | Halaman | Akses |
|---|---|---|
| `/login` | Login | Publik |
| `/register` | Register | Publik |
| `/` | Dashboard | Terproteksi |
| `/groups` | Daftar Kelompok | Terproteksi |
| `/groups/:groupId` | Detail Kelompok | Terproteksi |
| `/groups/:groupId/tasks` | Daftar Tugas | Terproteksi |
| `/groups/:groupId/tasks/:taskId` | Detail Tugas | Terproteksi |
| `/groups/:groupId/evaluation` | Evaluasi Kontribusi | Terproteksi |
| `/groups/:groupId/report` | Laporan | Terproteksi |

Semua halaman terproteksi dibungkus `ProtectedRoute` yang mengarahkan ke `/login` jika user belum autentikasi.

## Database Schema

### Tabel Utama

| Tabel | Deskripsi |
|---|---|
| `profiles` | Profil user (terhubung ke `auth.users`) |
| `groups` | Kelompok belajar |
| `group_members` | Anggota kelompok (role: `leader` / `member`) |
| `tasks` | Tugas dalam kelompok |
| `progress_updates` | Update progres tugas |
| `progress_files` | File bukti progres (storage) |
| `contribution_periods` | Periode evaluasi kontribusi |
| `contribution_votes` | Voting kontribusi antarangota |
| `contribution_reviews` | Review nilai oleh ketua kelompok |

### Field Penting

**tasks:**
- `assignee_id` → user yang bertanggung jawab mengerjakan tugas
- `created_by` → user yang membuat tugas
- `priority`: `low` | `medium` | `high`
- `status`: `todo` | `in_progress` | `in_review` | `done`

**groups:**
- `invite_code` → kode undangan untuk bergabung
- `pin_hash` → hash PIN kelompok
- `leader_id` → ketua kelompok

**contribution_votes:**
- `score`: 1-5 (skala penilaian antarangota)
- `comment`: opsional, keterangan penilaian

**contribution_reviews:**
- `adjusted_score`: 1-5 (nilai akhir setelah review ketua, nullable)
- `review_text`: alasan penyesuaian (wajib jika adjusted_score diisi)

### Tabel Audit & Riwayat

| Tabel | Deskripsi |
|---|---|
| `score_audit_log` | Pencatatan semua perubahan nilai oleh ketua (nilai awal, nilai akhir, alasan, waktu) |
| `task_status_history` | Riwayat perubahan status tugas (otomatis via trigger) |

## Arsitektur

### Autentikasi
- Supabase Auth (email/password)
- `AuthContext` menyediakan `user`, `session`, `loading`, `signOut`
- Trigger `on_auth_user_created` otomatis membuat `profiles` saat user register

### Data Fetching
- **Tidak ada state management library** — menggunakan React hooks (`useState`, `useEffect`, `useMemo`)
- Data di-fetch langsung dari Supabase di dalam komponen/hook
- `useGroups()` — fetch semua kelompok yang diikuti user
- `useTasks(groupId)` — fetch tugas per kelompok
- Dashboard (`HomePage`) fetch data inline (bukan via hook)

### Keamanan
- **Row Level Security (RLS)** aktif di semua tabel
- Semua query Supabase menggunakan `anon key` — akses dibatasi oleh RLS policies
- Fungsi helper: `is_group_member()`, `is_group_leader()`, `validate_invite_and_pin()`

### Storage
- Bucket `progress-files` (**privat**, akses via signed URL)
- Bucket `avatars` (**privat**, akses via signed URL)
- File disimpan di Supabase Storage, metadata di `progress_files`

## Konvensi Kode

- **Bahasa Indonesia** untuk UI text dan komentar
- **Functional components** dengan hooks
- **Interface TypeScript** didefinisikan di dalam file yang menggunakannya (atau di hooks untuk tipe yang di-export)
- **Supabase query** menggunakan pattern: fetch → cek error → format data → set state
- **Error handling**: try/catch dengan pesan error ditampilkan ke user
- **Loading state**: spinner dengan `Loader2` icon dari lucide-react
- **Empty state**: komponen `EmptyState` dengan icon, title, dan description
- **Tanggal**: format `id-ID` menggunakan `toLocaleDateString('id-ID')`
- **Lint**: oxlint dengan beberapa disable comment untuk aturan spesifik
