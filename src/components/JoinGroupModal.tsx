import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Users } from 'lucide-react'
import { supabase } from '../lib/supabase/client'
import { useAuth } from '../contexts/AuthContext'
import { hashPin } from '../utils/hash'
import { Input } from './ui/Input'
import { Button } from './ui/Button'

const joinGroupSchema = z.object({
  invite_code: z.string().min(1, 'Kode undangan wajib diisi'),
  pin: z.string().length(6, 'PIN harus 6 digit'),
})

type JoinGroupFormData = z.infer<typeof joinGroupSchema>

interface JoinGroupModalProps {
  isOpen: boolean
  onClose: () => void
}

export function JoinGroupModal({ isOpen, onClose }: JoinGroupModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<JoinGroupFormData>({
    resolver: zodResolver(joinGroupSchema),
  })

  if (!isOpen) return null

  const handleClose = () => {
    reset()
    setError(null)
    onClose()
    window.location.reload()
  }

    const onSubmit = async (data: JoinGroupFormData) => {
    if (!user) {
      setError('Anda harus login terlebih dahulu')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // 1. Hash PIN yang diinput
      const hashedPin = await hashPin(data.pin)

      // 2. Panggil Fungsi Database (RPC) untuk validasi
      const { data: groupData, error: rpcError } = await supabase
        .rpc('validate_invite_and_pin', {
          p_invite_code: data.invite_code.trim(),
          p_pin_hash: hashedPin, // <-- PERBAIKAN: gunakan variabel hashedPin, bukan fungsi hashPin
        })
        .single()

      if (rpcError || !groupData) {
        setError('Kode undangan atau PIN salah')
        setLoading(false)
        return
      }

      // Beritahu TypeScript bentuk data yang dikembalikan oleh RPC
      const typedGroupData = groupData as { group_id: string; group_capacity: number }

      const group = {
        id: typedGroupData.group_id,
        capacity: typedGroupData.group_capacity,
        leader_id: null,
      }

      // 3. Cek kapasitas kelompok (PERBAIKAN: kembalikan logika ini)
      const { count: memberCount } = await supabase
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', group.id)

      if ((memberCount || 0) >= group.capacity) {
        setError('Kelompok sudah penuh')
        setLoading(false)
        return
      }

      // 4. Cek apakah user sudah anggota
      const { data: existingMember } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', group.id)
        .eq('user_id', user.id)
        .single()

      if (existingMember) {
        setError('Anda sudah menjadi anggota kelompok ini')
        setLoading(false)
        return
      }

      // 5. Tambahkan user sebagai anggota
      const { error: insertError } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          user_id: user.id,
          role: 'member',
        })

      if (insertError) throw insertError

      handleClose()
    } catch (err: any) {
      setError(err.message || 'Gagal bergabung ke kelompok')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
        <button onClick={handleClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center mb-3">
            <Users className="w-5 h-5 text-primary-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Gabung Kelompok</h2>
          <p className="text-sm text-slate-500 mt-1">Masukkan kode undangan dan PIN yang diberikan ketua kelompok.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Kode Undangan"
            placeholder="Contoh: 251132da-71c2-4b36-bd69-b8c739930f36"
            error={errors.invite_code?.message}
            {...register('invite_code')}
          />
          <Input
            label="PIN Undangan"
            placeholder="6 digit angka"
            error={errors.pin?.message}
            {...register('pin')}
          />

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
              Batal
            </Button>
            <Button type="submit" className="flex-1" isLoading={loading}>
              Gabung
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}