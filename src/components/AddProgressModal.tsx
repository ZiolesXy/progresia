import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, TrendingUp, Upload } from 'lucide-react'
import { supabase } from '../lib/supabase/client'
import { useAuth } from '../contexts/AuthContext'
import { Input } from './ui/Input'
import { Button } from './ui/Button'

const progressSchema = z.object({
  description: z.string().min(5, 'Deskripsi minimal 5 karakter'),
  progress_percentage: z.string().min(1, 'Persentase wajib diisi'),
})

type ProgressFormData = z.infer<typeof progressSchema>

interface AddProgressModalProps {
  isOpen: boolean
  taskId: string
  onClose: () => void
}

export function AddProgressModal({ isOpen, taskId, onClose }: AddProgressModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastProgress, setLastProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProgressFormData>({
    resolver: zodResolver(progressSchema),
  })

  useEffect(() => {
    if (isOpen && taskId) {
      const fetchLastProgress = async () => {
        const { data } = await supabase
          .from('progress_updates')
          .select('progress_percentage')
          .eq('task_id', taskId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
        
        setLastProgress(data?.progress_percentage ?? 0)
      }
      fetchLastProgress()
    }
  }, [isOpen, taskId])

  if (!isOpen) return null

  const handleClose = () => { 
    reset()
    setError(null)
    setSelectedFile(null)
    onClose()
    window.location.reload() 
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 5 * 1024 * 1024) {
        setError('Ukuran file maksimal 5MB')
        setSelectedFile(null)
        return
      }
      setSelectedFile(file)
      setError(null)
    }
  }

  const onSubmit = async (data: ProgressFormData) => {
    if (!user) return

    const percentage = Number(data.progress_percentage)
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      setError('Persentase harus antara 0 sampai 100')
      return
    }

    if (percentage < lastProgress) {
      setError(`Progres tidak boleh mundur! Terakhir: ${lastProgress}%`)
      return
    }

    setLoading(true)
    setError(null)

    try {
      let fileUrl = null
      let fileName = null
      let fileType = null

      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop()
        const filePath = `${taskId}/${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('progress-files')
          .upload(filePath, selectedFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('progress-files')
          .getPublicUrl(filePath)

        fileUrl = publicUrl
        fileName = selectedFile.name
        fileType = selectedFile.type
      }

      const { data: progressData, error: progressError } = await supabase
        .from('progress_updates')
        .insert({ 
          task_id: taskId, 
          user_id: user.id, 
          description: data.description, 
          progress_percentage: percentage 
        })
        .select('id')
        .single()

      if (progressError) throw progressError

      if (fileUrl && progressData) {
        const { error: fileError } = await supabase
          .from('progress_files')
          .insert({ 
            progress_update_id: progressData.id, 
            task_id: taskId,
            file_path: fileUrl,
            file_name: fileName,
            file_type: fileType,
            uploaded_by: user.id
          })

        if (fileError) throw fileError
      }

      handleClose()
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan progres')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative my-8">
        <button onClick={handleClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>
        
        <div className="mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-primary-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Tambah Pembaruan Progres</h2>
          <p className="text-sm text-slate-500 mt-1">Progres terakhir: <span className="font-bold text-primary-600">{lastProgress}%</span></p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input 
            label="Deskripsi Progres" 
            placeholder="Contoh: Selesai membuat komponen Navbar..." 
            error={errors.description?.message} 
            {...register('description')} 
          />
          <Input 
            label="Persentase Selesai (0-100)" 
            type="number" 
            placeholder="50" 
            error={errors.progress_percentage?.message} 
            {...register('progress_percentage')} 
          />

          {/* Input File - PERBAIKAN DESAIN */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Bukti Pekerjaan (Opsional, Max 5MB)</label>
            <div className="relative">
              <label className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors w-full">
                <Upload className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span className="text-sm text-slate-600 truncate flex-1 min-w-0">
                  {selectedFile ? selectedFile.name : 'Pilih File...'}
                </span>
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={handleFileChange} 
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip" 
                />
              </label>
              {selectedFile && (
                <button 
                  type="button" 
                  onClick={() => setSelectedFile(null)} 
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-700 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>Batal</Button>
            <Button type="submit" className="flex-1" isLoading={loading}>Simpan Progres</Button>
          </div>
        </form>
      </div>
    </div>
  )
}