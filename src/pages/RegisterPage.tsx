import { Link } from 'react-router-dom'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

export function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-xl bg-primary-600 items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">K</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Buat Akun Baru</h1>
          <p className="mt-1 text-slate-500">Mulai kelola kontribusi kelompok Anda.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 sm:p-8">
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <Input
              label="Nama Lengkap"
              placeholder="Masukkan nama lengkap"
              autoComplete="name"
            />
            <Input
              label="NIM"
              placeholder="Nomor Induk Mahasiswa"
              autoComplete="off"
            />
            <Input
              label="Email"
              type="email"
              placeholder="nama@universitas.ac.id"
              autoComplete="email"
            />
            <Input
              label="Kata Sandi"
              type="password"
              placeholder="Minimal 8 karakter"
              autoComplete="new-password"
            />
            <Button type="submit" fullWidth size="lg">
              Daftar
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}