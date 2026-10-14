import { useState } from 'react'
import { X, CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabase/client'
import { Button } from './ui/Button'

interface UpdateStatusModalProps {
  isOpen: boolean
  taskId: string
  currentStatus: string
  onClose: () => void
}

const statusOptions = [
  { value: 'todo', label: 'Belum Dikerjakan' },
  { value: 'in_progress', label: 'Sedang Dikerjakan' },
  { value: 'in_review', label: 'Dalam Review' },
  { value: 'done', label: 'Selesai' },
]

export function UpdateStatusModal({ isOpen, taskId, currentStatus, onClose }: UpdateStatusModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newStatus, setNewStatus] = useState(currentStatus)

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (newStatus === currentStatus) {
      onClose()
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId)

      if (updateError) throw updateError
      window.location.reload()
    } catch (err: any) {
      setError(err.message || 'Gagal mengubah status')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6 text-primary-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Ubah Status Tugas</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Status Baru</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Batal</Button>
            <Button className="flex-1" onClick={handleSubmit} isLoading={loading}>Simpan</Button>
          </div>
        </div>
      </div>
    </div>
  )
}