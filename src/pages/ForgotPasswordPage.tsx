import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '../lib/supabase/client'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { MailCheck } from 'lucide-react'

const forgotPasswordSchema = z.object({
  email: z.string().email('Email tidak valid'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [sentEmail, setSentEmail] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true)
    setError(null)

    const redirectTo = `${window.location.origin}/reset-password`

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSentEmail(data.email)
      setEmailSent(true)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-xl bg-primary-600 items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Lupa Kata Sandi</h1>
          <p className="mt-1 text-slate-500">
            Masukkan email Anda untuk menerima tautan reset kata sandi.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 sm:p-8">
          {emailSent ? (
            <div className="text-center space-y-4">
              <div className="inline-flex w-12 h-12 rounded-full bg-green-50 items-center justify-center">
                <MailCheck className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Email Terkirim</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Jika akun dengan email <span className="font-medium text-slate-700">{sentEmail}</span> terdaftar,
                  kami telah mengirimkan tautan untuk mengatur ulang kata sandi. Silakan cek inbox atau folder spam Anda.
                </p>
              </div>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 text-base font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Kembali ke Masuk
              </Link>
            </div>
          ) : (
            <>
              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <Input
                  label="Email"
                  type="email"
                  placeholder="nama@universitas.ac.id"
                  autoComplete="email"
                  error={errors.email?.message}
                  {...register('email')}
                />

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {error}
                  </div>
                )}

                <Button type="submit" fullWidth size="lg" isLoading={loading}>
                  Kirim Tautan Reset
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-600">
                Ingat kata sandi?{' '}
                <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                  Masuk di sini
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
