import { Link } from 'react-router-dom'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

export function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-xl bg-primary-600 items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">K</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Masuk ke Kontribusi</h1>
          <p className="mt-1 text-slate-500">Kelola tugas kelompok dengan lebih adil.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 sm:p-8">
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <Input
              label="Email"
              type="email"
              placeholder="nama@universitas.ac.id"
              autoComplete="email"
            />
            <Input
              label="Kata Sandi"
              type="password"
              placeholder="Masukkan kata sandi"
              autoComplete="current-password"
            />
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input type="checkbox" className="rounded border-slate-300" />
                Ingat saya
              </label>
              <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                Lupa kata sandi?
              </a>
            </div>
            <Button type="submit" fullWidth size="lg">
              Masuk
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Belum punya akun?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}