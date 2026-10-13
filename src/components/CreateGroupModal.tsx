import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Copy, CheckCircle2, Key, Users } from 'lucide-react'
import { supabase } from '../lib/supabase/client'
import { useAuth } from '../contexts/AuthContext'
import { hashPin, generatePin } from '../utils/hash'
import { Input } from './ui/Input'
import { Button } from './ui/Button'

const createGroupSchema = z.object({
    name: z.string().min(3, 'Nama kelompok minimal 3 karakter'),
    course_name: z.string().min(3, 'Nama mata kuliah minimal 3 karakter'),
    description: z.string().optional(),
    capacity: z.string().min(1, 'Kapasitas wajib diisi'),
})

type CreateGroupFormData = z.infer<typeof createGroupSchema>

interface CreateGroupModalProps {
    isOpen: boolean
    onClose: () => void
}

export function CreateGroupModal({ isOpen, onClose }: CreateGroupModalProps) {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successData, setSuccessData] = useState<{ inviteCode: string; rawPin: string } | null>(null)

    const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateGroupFormData>({
        resolver: zodResolver(createGroupSchema),
    })

    if (!isOpen) return null

    const handleClose = () => {
        reset()
        setError(null)
        setSuccessData(null)
        onClose()
        window.location.reload()
    }

    const onSubmit = async (data: CreateGroupFormData) => {
        if (!user) {
            console.error('USER TIDAK ADA! Sesi mungkin hilang.')
            setError('Anda harus login terlebih dahulu')
            return
        }

        console.log('=== DEBUG INFO ===')
        console.log('User ID:', user.id)
        console.log('Auth Role:', user.role)
        console.log('==================')

        // Validasi manual untuk capacity
        const capacity = Number(data.capacity)
        if (isNaN(capacity) || capacity < 2) {
            setError('Kapasitas minimal 2 orang')
            return
        }
        if (capacity > 10) {
            setError('Maksimal 10 orang')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const rawPin = generatePin()
            const hashedPin = await hashPin(rawPin)

            const { data: groupData, error: groupError } = await supabase
                .from('groups')
                .insert({
                    name: data.name,
                    course_name: data.course_name,
                    description: data.description || null,
                    capacity: capacity,
                    pin_hash: hashedPin,
                    leader_id: user.id,
                })
                .select('id, invite_code')
                .single()

            if (groupError) throw groupError

            const { error: memberError } = await supabase
                .from('group_members')
                .insert({
                    group_id: groupData.id,
                    user_id: user.id,
                    role: 'leader',
                })

            if (memberError) throw memberError

            setSuccessData({
                inviteCode: groupData.invite_code,
                rawPin: rawPin,
            })
        } catch (err: any) {
            console.error('=== FULL SUPABASE ERROR ===')
            console.error(err)
            console.error('===========================')
            setError(err.message || 'Gagal membuat kelompok')
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
    }

    // Tampilan Sukses
    if (successData) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
                    <button onClick={handleClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>

                    <div className="text-center mb-6">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">Kelompok Berhasil Dibuat!</h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Simpan kode undangan dan PIN di bawah ini. <span className="text-red-600 font-medium">PIN hanya ditampilkan sekali.</span>
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Kode Undangan</label>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono text-slate-900">
                                    {successData.inviteCode}
                                </code>
                                <Button variant="outline" size="sm" onClick={() => copyToClipboard(successData.inviteCode)}>
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">PIN Undangan (Rahasia)</label>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm font-mono text-amber-900 font-bold tracking-wider">
                                    {successData.rawPin}
                                </code>
                                <Button variant="outline" size="sm" onClick={() => copyToClipboard(successData.rawPin)}>
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700 flex items-start gap-2">
                            <Key className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <p>Bagikan Kode dan PIN ini kepada anggota kelompok Anda. Mereka akan membutuhkannya untuk bergabung.</p>
                        </div>
                    </div>

                    <Button className="w-full mt-6" onClick={handleClose}>
                        Selesai
                    </Button>
                </div>
            </div>
        )
    }

    // Tampilan Form
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
                    <h2 className="text-xl font-bold text-slate-900">Buat Kelompok Baru</h2>
                    <p className="text-sm text-slate-500 mt-1">Isi detail kelompok Anda. PIN akan digenerate otomatis.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label="Nama Kelompok"
                        placeholder="Contoh: Kelompok Alpha"
                        error={errors.name?.message}
                        {...register('name')}
                    />
                    <Input
                        label="Mata Kuliah"
                        placeholder="Contoh: Rekayasa Perangkat Lunak"
                        error={errors.course_name?.message}
                        {...register('course_name')}
                    />
                    <Input
                        label="Deskripsi (Opsional)"
                        placeholder="Deskripsi singkat tujuan kelompok..."
                        error={errors.description?.message}
                        {...register('description')}
                    />
                    <Input
                        label="Kapasitas Anggota"
                        type="number"
                        placeholder="Maksimal 10"
                        error={errors.capacity?.message}
                        {...register('capacity')}
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
                            Buat Kelompok
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}