import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '../lib/supabase/client'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

const registerSchema = z.object({
  fullName: z.string().min(2, 'Nama lengkap minimal 2 karakter'),
  studentId: z.string().min(5, 'NIM tidak valid'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Kata sandi minimal 6 karakter'),
})

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          student_id: data.studentId,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // Supabase mungkin mengirim email konfirmasi. 
      // Untuk development, kita bisa langsung arahkan ke login atau dashboard tergantung konfigurasi.
      alert('Registrasi berhasil! Silakan cek email untuk konfirmasi (jika diaktifkan), atau langsung login.')
      navigate('/login')
    }
  }

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
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Nama Lengkap"
              placeholder="Masukkan nama lengkap"
              error={errors.fullName?.message}
              {...register('fullName')}
            />
            <Input
              label="NIM"
              placeholder="Nomor Induk Mahasiswa"
              error={errors.studentId?.message}
              {...register('studentId')}
            />
            <Input
              label="Email"
              type="email"
              placeholder="nama@universitas.ac.id"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Kata Sandi"
              type="password"
              placeholder="Minimal 6 karakter"
              error={errors.password?.message}
              {...register('password')}
            />

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" fullWidth size="lg" isLoading={loading}>
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