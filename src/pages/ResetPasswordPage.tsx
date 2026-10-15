import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { type Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase/client'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { KeyRound, CheckCircle2, AlertCircle } from 'lucide-react'

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Kata sandi minimal 6 karakter'),
  confirmPassword: z.string().min(6, 'Konfirmasi kata sandi minimal 6 karakter'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Konfirmasi kata sandi tidak cocok',
  path: ['confirmPassword'],
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export function ResetPasswordPage() {
  const [session, setSession] = useState<Session | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  // Tautan reset dari email berisi token di URL hash (#access_token=...&type=recovery).
  // supabase-js otomatis mendeteksi & menukarnya menjadi session recovery.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setCheckingSession(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setCheckingSession(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const onSubmit = async (data: ResetPasswordFormData) => {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.updateUser({ password: data.password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="h-8 w-8 rounded-full border-2 border-primary-200 border-t-primary-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-xl bg-primary-600 items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Atur Ulang Kata Sandi</h1>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 sm:p-8">
          {success ? (
            <div className="text-center space-y-4">
              <div className="inline-flex w-12 h-12 rounded-full bg-green-50 items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Kata Sandi Berhasil Diubah</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Anda dapat masuk menggunakan kata sandi baru Anda.
                </p>
              </div>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 text-base font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Masuk Sekarang
              </Link>
            </div>
          ) : !session ? (
            <div className="text-center space-y-4">
              <div className="inline-flex w-12 h-12 rounded-full bg-red-50 items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Tautan Tidak Valid</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Tautan reset kata sandi tidak valid atau telah kedaluwarsa.
                  Silakan minta tautan baru dari halaman lupa kata sandi.
                </p>
              </div>
              <Link
                to="/forgot-password"
                className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 text-base font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Minta Tautan Baru
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-600">
                <KeyRound className="w-4 h-4 text-primary-600" />
                <p className="text-sm">
                  Masukkan kata sandi baru untuk akun{' '}
                  <span className="font-medium text-slate-900">{session.user.email}</span>.
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <Input
                  label="Kata Sandi Baru"
                  type="password"
                  placeholder="Minimal 6 karakter"
                  autoComplete="new-password"
                  error={errors.password?.message}
                  {...register('password')}
                />
                <Input
                  label="Konfirmasi Kata Sandi Baru"
                  type="password"
                  placeholder="Ulangi kata sandi baru"
                  autoComplete="new-password"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {error}
                  </div>
                )}

                <Button type="submit" fullWidth size="lg" isLoading={loading}>
                  Simpan Kata Sandi Baru
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
