import { useState } from 'react'
import { X, Key, RefreshCw, AlertTriangle } from 'lucide-react'
import { supabase } from '../lib/supabase/client'
import { hashPin, generatePin } from '../utils/hash'
import { Button } from './ui/Button'
import { Copy, CheckCircle2 } from 'lucide-react'

interface ResetPinModalProps {
  isOpen: boolean
  groupId: string
  onClose: () => void
}

export function ResetPinModal({ isOpen, groupId, onClose }: ResetPinModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newPin, setNewPin] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const handleClose = () => {
    setNewPin(null)
    setError(null)
    setCopied(false)
    onClose()
  }

  const handleReset = async () => {
    setLoading(true)
    setError(null)

    try {
      // 1. Generate PIN baru dan hash
      const rawPin = generatePin()
      const hashedPin = await hashPin(rawPin)

      // 2. Update PIN di database
      const { error: updateError } = await supabase
        .from('groups')
        .update({ pin_hash: hashedPin })
        .eq('id', groupId)

      if (updateError) throw updateError

      // 3. Tampilkan PIN baru
      setNewPin(rawPin)
    } catch (err: any) {
      setError(err.message || 'Gagal mereset PIN')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Tampilan Konfirmasi
  if (!newPin) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
          <button onClick={handleClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
          
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Reset PIN Undangan</h2>
            <p className="text-sm text-slate-500 mt-2">
              PIN lama akan <span className="text-red-600 font-medium">hangus permanen</span> dan tidak bisa digunakan lagi. Anggota yang memiliki PIN lama tidak akan bisa bergabung.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleClose}>
              Batal
            </Button>
            <Button className="flex-1" onClick={handleReset} isLoading={loading}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset PIN
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Tampilan Sukses (PIN Baru)
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
          <h2 className="text-xl font-bold text-slate-900">PIN Berhasil Direset!</h2>
          <p className="text-sm text-slate-500 mt-1">
            PIN baru telah dibuat. <span className="text-red-600 font-medium">Simpan sekarang, hanya ditampilkan sekali.</span>
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">PIN Undangan Baru (Rahasia)</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm font-mono text-amber-900 font-bold tracking-wider">
                {newPin}
              </code>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(newPin)}>
                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Tersalin' : 'Salin'}
              </Button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700 flex items-start gap-2">
            <Key className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>Bagikan PIN baru ini kepada anggota yang belum bergabung. PIN lama sudah tidak berlaku.</p>
          </div>
        </div>

        <Button className="w-full mt-6" onClick={handleClose}>
          Selesai
        </Button>
      </div>
    </div>
  )
}