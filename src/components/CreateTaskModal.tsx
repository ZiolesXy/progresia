import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Plus } from 'lucide-react'
import { supabase } from '../lib/supabase/client'
import { useAuth } from '../contexts/AuthContext'
import { Input } from './ui/Input'
import { Button } from './ui/Button'

const createTaskSchema = z.object({
  title: z.string().min(3, 'Judul tugas minimal 3 karakter'),
  description: z.string().optional(),
  assignee_id: z.string().min(1, 'Pilih penanggung jawab'),
  deadline: z.string().min(1, 'Tenggat waktu wajib diisi'),
  priority: z.enum(['low', 'medium', 'high']),
})

type CreateTaskFormData = z.infer<typeof createTaskSchema>

interface CreateTaskModalProps {
  isOpen: boolean
  groupId: string
  onClose: () => void
}

interface Member {
  id: string
  full_name: string
  student_id: string
}

export function CreateTaskModal({ isOpen, groupId, onClose }: CreateTaskModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [members, setMembers] = useState<Member[]>([])

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      priority: 'medium',
    }
  })

  useEffect(() => {
    if (!isOpen || !groupId) return

    const fetchMembers = async () => {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          user_id,
          profiles:user_id (full_name, student_id)
        `)
        .eq('group_id', groupId)

      if (!error && data) {
        const formattedMembers = data.map((m: any) => ({
          id: m.user_id,
          full_name: m.profiles?.full_name || 'Unknown',
          student_id: m.profiles?.student_id || '',
        }))
        setMembers(formattedMembers)
      }
    }

    fetchMembers()
  }, [isOpen, groupId])

  if (!isOpen) return null

  const handleClose = () => {
    reset()
    setError(null)
    onClose()
    window.location.reload()
  }

  const onSubmit = async (data: CreateTaskFormData) => {
    if (!user) {
      setError('Anda harus login terlebih dahulu')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error: insertError } = await supabase
        .from('tasks')
        .insert({
          group_id: groupId,
          title: data.title,
          description: data.description || null,
          assignee_id: data.assignee_id,
          deadline: new Date(data.deadline).toISOString(),
          priority: data.priority,
          status: 'todo',
          created_by: user.id,
        })

      if (insertError) throw insertError

      handleClose()
    } catch (err: any) {
      setError(err.message || 'Gagal membuat tugas')
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
            <Plus className="w-5 h-5 text-primary-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Buat Tugas Baru</h2>
          <p className="text-sm text-slate-500 mt-1">Tugas akan langsung terlihat oleh semua anggota kelompok.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Judul Tugas"
            placeholder="Contoh: Desain ERD Sistem"
            error={errors.title?.message}
            {...register('title')}
          />
          
          <Input
            label="Deskripsi (Opsional)"
            placeholder="Deskripsi detail tugas..."
            error={errors.description?.message}
            {...register('description')}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Penanggung Jawab
            </label>
            <select
              {...register('assignee_id')}
              className={`
                w-full px-3 py-2 bg-white border rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-offset-0
                ${errors.assignee_id 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                  : 'border-slate-300 focus:border-primary-500 focus:ring-primary-200'}
              `}
            >
              <option value="">Pilih anggota...</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.full_name} ({member.student_id})
                </option>
              ))}
            </select>
            {errors.assignee_id && (
              <p className="mt-1 text-sm text-red-600">{errors.assignee_id.message}</p>
            )}
          </div>

          <Input
            label="Tenggat Waktu"
            type="datetime-local"
            error={errors.deadline?.message}
            {...register('deadline')}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Prioritas
            </label>
            <select
              {...register('priority')}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
            >
              <option value="low">Rendah</option>
              <option value="medium">Sedang</option>
              <option value="high">Tinggi</option>
            </select>
          </div>

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
              Buat Tugas
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}