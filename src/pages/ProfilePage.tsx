import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '../lib/supabase/client'
import { useAuth } from '../contexts/AuthContext'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { User, Camera, Save, CheckCircle2, ArrowLeft } from 'lucide-react'

const AVATAR_MAX_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

const profileSchema = z.object({
  fullName: z.string().min(2, 'Nama lengkap minimal 2 karakter'),
  studentId: z.string().min(5, 'NIM tidak valid'),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface Profile {
  id: string
  full_name: string | null
  student_id: string | null
  avatar_url: string | null
  email?: string | null
}

export function ProfilePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  // Ambil data profil dari tabel profiles
  useEffect(() => {
    if (!user) return

    const fetchProfile = async () => {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id, full_name, student_id, avatar_url')
        .eq('id', user.id)
        .single()

      if (fetchError) {
        setError('Gagal memuat profil.')
      } else {
        setProfile(data)
        // avatar_url sekarang adalah path storage, bukan public URL
        // Kita perlu signed URL untuk menampilkannya
        if (data.avatar_url) {
          const { data: signedUrlData } = await supabase.storage
            .from('avatars')
            .createSignedUrl(data.avatar_url, 3600)
          setAvatarUrl(signedUrlData?.signedUrl || null)
        }
        reset({
          fullName: data.full_name ?? '',
          studentId: data.student_id ?? '',
        })
      }
    }
    fetchProfile()
    // oxlint-disable react-hooks/exhaustive-deps
  }, [user])

  // Preview avatar sebelum diupload
  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(null)
      return
    }
    const preview = URL.createObjectURL(avatarFile)
    setAvatarPreview(preview)
    return () => URL.revokeObjectURL(preview)
  }, [avatarFile])

  if (!user) return null

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setError('Format gambar tidak didukung. Gunakan JPG, PNG, WebP, atau GIF.')
      return
    }
    if (file.size > AVATAR_MAX_SIZE) {
      setError('Ukuran gambar maksimal 2MB.')
      return
    }

    setError(null)
    setAvatarFile(file)
  }

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile) return profile?.avatar_url || null

    setUploadingAvatar(true)
    // Path: <user_id>/<timestamp>-<filename>
    const safeName = avatarFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${user.id}/${Date.now()}-${safeName}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, avatarFile, { upsert: true })

    if (uploadError) {
      setUploadingAvatar(false)
      throw new Error('Gagal mengunggah avatar. Coba lagi.')
    }

    setUploadingAvatar(false)
    // Return path storage (bucket sekarang private)
    return path
  }

  const onSubmit = async (data: ProfileFormData) => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const avatarPath = await uploadAvatar()

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: data.fullName,
          student_id: data.studentId,
          avatar_url: avatarPath,
        })
        .eq('id', user.id)

      if (updateError) throw new Error('Gagal menyimpan profil.')

      // Sinkronkan juga metadata di auth.users (dipakai saat registrasi)
      await supabase.auth.updateUser({
        data: { full_name: data.fullName, student_id: data.studentId },
      })

      setProfile((prev) => prev ? {
        ...prev,
        full_name: data.fullName,
        student_id: data.studentId,
        avatar_url: avatarPath,
      } : prev)

      // Update avatar URL untuk display
      if (avatarPath) {
        const { data: signedUrlData } = await supabase.storage
          .from('avatars')
          .createSignedUrl(avatarPath, 3600)
        setAvatarUrl(signedUrlData?.signedUrl || null)
      }

      setAvatarFile(null)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan.')
    } finally {
      setSaving(false)
    }
  }

  const displayAvatar = avatarPreview || avatarUrl
  const initial = profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase() || '?'

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Profil Saya</h1>
        <p className="mt-1 text-slate-500">Kelola informasi akun Anda.</p>
      </div>

      <Card>
        <div className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden border border-slate-200">
                {displayAvatar ? (
                  <img src={displayAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-primary-700 font-semibold text-2xl">{initial}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 transition-colors border-2 border-white"
                title="Ganti foto profil"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept={ALLOWED_AVATAR_TYPES.join(',')}
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div>
              <p className="font-medium text-slate-900">Foto Profil</p>
              <p className="text-sm text-slate-500 mt-0.5">
                JPG, PNG, WebP, atau GIF. Maksimal 2MB.
              </p>
              {avatarFile && (
                <p className="text-sm text-primary-600 mt-1">
                  {avatarFile.name} — klik Simpan untuk mengunggah.
                </p>
              )}
            </div>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                disabled
                value={user.email ?? ''}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-500 disabled:cursor-not-allowed"
              />
              <p className="mt-1 text-sm text-slate-400">Email tidak dapat diubah.</p>
            </div>

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

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                Profil berhasil disimpan.
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button type="submit" isLoading={saving || uploadingAvatar}>
                <Save className="w-4 h-4" />
                Simpan Perubahan
              </Button>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <User className="w-4 h-4" />
                <span>Masuk sebagai {user.email}</span>
              </div>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}
