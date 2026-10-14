import { useParams, Link, useNavigate } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { ArrowLeft, User, Flag, Calendar, Loader2, TrendingUp, Lock, Play, CheckCircle2, RotateCcw, FileText, Clock, Eye } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase/client'
import { useAuth } from '../contexts/AuthContext'
import { AddProgressModal } from '../components/AddProgressModal'

interface TaskDetail {
  id: string
  title: string
  description: string | null
  assignee_id: string | null
  deadline: string | null
  priority: 'low' | 'medium' | 'high'
  status: 'todo' | 'in_progress' | 'in_review' | 'done'
  created_at: string
  group_id: string
  assignee?: { full_name: string; student_id: string } | null
}

interface ProgressUpdate {
  id: string
  description: string
  progress_percentage: number | null
  created_at: string
  profiles: { full_name: string } | null
  progress_files?: { id: string; file_path: string; file_name: string }[]
}

export function TaskDetailPage() {
  const { groupId, taskId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [task, setTask] = useState<TaskDetail | null>(null)
  const [progressUpdates, setProgressUpdates] = useState<ProgressUpdate[]>([])
  const [loading, setLoading] = useState(true)

  const [isLeader, setIsLeader] = useState(false)
  const [isAssignee, setIsAssignee] = useState(false)
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    if (!groupId || !taskId || !user) return

    const fetchData = async () => {
      setLoading(true)

      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select(`*, assignee:assignee_id (full_name, student_id)`)
        .eq('id', taskId)
        .single()

      if (taskError || !taskData) { 
        setLoading(false)
        return 
      }

      const formattedTask = { 
        ...taskData, 
        assignee: Array.isArray(taskData.assignee) ? taskData.assignee[0] : taskData.assignee 
      }
      setTask(formattedTask)

      const { data: progressData, error: progressError } = await supabase
        .from('progress_updates')
        .select(`
          id, 
          description, 
          progress_percentage, 
          created_at,
          user_id,
          profiles:user_id(full_name),
          progress_files(id, file_path, file_name)
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: true })

      if (progressError) {
        console.error("Error fetching progress:", progressError)
      }

      if (progressData) {
        setProgressUpdates(progressData.map((p: any) => ({ 
          ...p, 
          profiles: Array.isArray(p.profiles) ? p.profiles[0] : p.profiles,
          progress_files: p.progress_files || []
        })))
      }

      const { data: memberData } = await supabase
        .from('group_members')
        .select('role')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single()

      setIsLeader(memberData?.role === 'leader')
      setIsAssignee(taskData.assignee_id === user.id)
      setLoading(false)
    }

    fetchData()
  }, [groupId, taskId, user])

  const handleQuickStatus = async (newStatus: string) => {
    if (!task) return
    setUpdatingStatus(true)
    const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', task.id)
    if (!error) {
      setTask({ ...task, status: newStatus as any })
    } else {
      alert('Gagal mengubah status: ' + error.message)
    }
    setUpdatingStatus(false)
  }

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    </Layout>
  )

  if (!task) return (
    <Layout>
      <div className="text-center py-12 px-4">
        <p className="text-slate-500 mb-4">Tugas tidak ditemukan.</p>
        <Link to={`/groups/${groupId}/tasks`} className="text-primary-600 hover:underline">Kembali</Link>
      </div>
    </Layout>
  )

  const statusLabel = { todo: 'Belum Dikerjakan', in_progress: 'Sedang Dikerjakan', in_review: 'Dalam Review', done: 'Selesai' }
  const statusColor = { todo: 'default' as const, in_progress: 'warning' as const, in_review: 'info' as const, done: 'success' as const }
  const priorityLabel = { low: 'Rendah', medium: 'Sedang', high: 'Tinggi' }

  return (
    <Layout>
      {/* HEADER - MOBILE FRIENDLY */}
      <div className="mb-4 sm:mb-6 px-4 sm:px-0">
        <button 
          onClick={() => navigate(`/groups/${groupId}/tasks`)} 
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 mb-3"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 break-words">{task.title}</h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">Dibuat pada {new Date(task.created_at).toLocaleDateString('id-ID')}</p>
          </div>
          <Badge variant={statusColor[task.status]} size="md" className="flex-shrink-0">
            {statusLabel[task.status]}
          </Badge>
        </div>
      </div>

      {/* GRID LAYOUT - 1 KOLOM DI MOBILE, 3 KOLOM DI DESKTOP */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 px-4 sm:px-0">
        
        {/* KOLOM KIRI: DESKRIPSI & PROGRES (2/3 di desktop) */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          
          {/* Card Deskripsi */}
          <Card title="Deskripsi">
            <p className="text-sm sm:text-base text-slate-700 whitespace-pre-line break-words">
              {task.description || 'Tidak ada deskripsi.'}
            </p>
          </Card>

          {/* Card Riwayat Progres */}
          <Card title="Riwayat Progres" description={`${progressUpdates.length} pembaruan`}>
            {progressUpdates.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-sm">Belum ada pembaruan progres.</div>
            ) : (
              <ol className="relative border-l-2 border-slate-200 ml-3 space-y-4 sm:space-y-6">
                {progressUpdates.map((update) => (
                  <li key={update.id} className="ml-6">
                    <span className="absolute -left-2.5 flex items-center justify-center w-5 h-5 rounded-full bg-primary-100 ring-4 ring-white">
                      <span className="w-2 h-2 rounded-full bg-primary-600"></span>
                    </span>
                    <div className="bg-slate-50 rounded-lg p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-2 gap-2">
                        <p className="text-sm font-medium text-slate-900 truncate">{update.profiles?.full_name || 'User'}</p>
                        <time className="text-xs text-slate-500 whitespace-nowrap">
                          {new Date(update.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </time>
                      </div>
                      <p className="text-sm text-slate-700 mb-2 break-words">{update.description}</p>
                      
                      {/* File Lampiran */}
                      {update.progress_files && update.progress_files.length > 0 && (
                        <div className="mb-3 space-y-2">
                          <p className="text-xs font-medium text-slate-500">📎 File Lampiran:</p>
                          {update.progress_files.map((file: any) => (
                            <div 
                              key={file.id}
                              className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-lg"
                            >
                              <FileText className="w-4 h-4 text-primary-600 flex-shrink-0" />
                              <span className="flex-1 text-xs sm:text-sm text-slate-700 truncate min-w-0">{file.file_name}</span>
                              <a 
                                href={file.file_path} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-primary-600 text-white text-xs font-medium rounded hover:bg-primary-700 transition-colors flex-shrink-0"
                              >
                                <Eye className="w-3 h-3" />
                                <span className="hidden sm:inline">Lihat</span>
                              </a>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Progress Bar */}
                      {update.progress_percentage !== null && (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                            <div className="bg-primary-600 h-1.5 rounded-full" style={{ width: `${update.progress_percentage}%` }}></div>
                          </div>
                          <span className="text-xs font-medium text-slate-600">{update.progress_percentage}%</span>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>

        {/* KOLOM KANAN: DETAIL & AKSI (1/3 di desktop, pindah ke bawah di mobile) */}
        <div className="space-y-4 sm:space-y-6">
          
          {/* Card Detail Tugas */}
          <Card title="Detail Tugas">
            <dl className="space-y-3 sm:space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <dt className="text-slate-500 text-xs">Penanggung Jawab</dt>
                  <dd className="text-slate-900 font-medium break-words">{task.assignee ? task.assignee.full_name : 'Belum diassign'}</dd>
                </div>
              </div>
              {task.deadline && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <dt className="text-slate-500 text-xs">Tenggat Waktu</dt>
                    <dd className="text-slate-900 font-medium break-words">
                      {new Date(task.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </dd>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Flag className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <dt className="text-slate-500 text-xs">Prioritas</dt>
                  <dd className="font-medium break-words">
                    <span className={task.priority === 'high' ? 'text-red-600' : task.priority === 'medium' ? 'text-amber-600' : 'text-slate-600'}>
                      {priorityLabel[task.priority]}
                    </span>
                  </dd>
                </div>
              </div>
            </dl>
          </Card>

          {/* Card Aksi Cepat */}
          <Card title="Aksi Cepat">
            {isAssignee ? (
              <div className="space-y-2">
                {task.status === 'todo' && (
                  <>
                    <Button fullWidth size="sm" onClick={() => handleQuickStatus('in_progress')} isLoading={updatingStatus}>
                      <Play className="w-4 h-4 mr-2" /> Mulai Mengerjakan
                    </Button>
                    <Button variant="outline" fullWidth size="sm" onClick={() => setShowProgressModal(true)}>
                      <TrendingUp className="w-4 h-4 mr-2" /> Tambah Laporan Progres
                    </Button>
                  </>
                )}
                {task.status === 'in_progress' && (
                  <>
                    <Button fullWidth variant="secondary" size="sm" onClick={() => handleQuickStatus('in_review')} isLoading={updatingStatus}>
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Ajukan Selesai (Review)
                    </Button>
                    <Button variant="outline" fullWidth size="sm" onClick={() => setShowProgressModal(true)}>
                      <TrendingUp className="w-4 h-4 mr-2" /> Tambah Laporan Progres
                    </Button>
                  </>
                )}
                {task.status === 'in_review' && (
                  <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                    <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />
                    <span>Tugas sudah diajukan. <strong>Menunggu direview ketua.</strong></span>
                  </div>
                )}
                {task.status === 'done' && (
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>Tugas telah selesai dan disetujui ketua.</span>
                  </div>
                )}
              </div>
            ) : isLeader ? (
              <div className="space-y-2">
                {task.status === 'in_review' ? (
                  <>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 mb-2">
                      <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />
                      <span>Anggota sudah mengajukan selesai. Silakan review.</span>
                    </div>
                    <Button fullWidth size="sm" onClick={() => handleQuickStatus('done')} isLoading={updatingStatus}>
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Acc / Setujui Selesai
                    </Button>
                    <Button fullWidth variant="outline" size="sm" onClick={() => handleQuickStatus('in_progress')} isLoading={updatingStatus}>
                      <RotateCcw className="w-4 h-4 mr-2" /> Minta Revisi
                    </Button>
                  </>
                ) : task.status === 'in_progress' || task.status === 'todo' ? (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600">
                    <Clock className="w-5 h-5 flex-shrink-0" />
                    <span><strong>Menunggu anggota selesai</strong> mengerjakan tugas ini.</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>Tugas telah selesai.</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <Lock className="w-4 h-4" />
                <span>Anda hanya bisa memantau progres tugas ini.</span>
              </div>
            )}
          </Card>
        </div>
      </div>

      <AddProgressModal isOpen={showProgressModal} taskId={task.id} onClose={() => setShowProgressModal(false)} />
    </Layout>
  )
}