import { useParams, Link } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { ArrowLeft, Clock, User, Flag, Calendar, MessageSquare, Upload } from 'lucide-react'
import { tasks, progressUpdates } from '../data/dummy'

export function TaskDetailPage() {
  const { groupId, taskId } = useParams()
  
  const task = tasks.find(t => t.id === taskId)
  const taskProgress = progressUpdates.filter(p => p.taskId === taskId)

  if (!task) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-slate-500">Tugas tidak ditemukan.</p>
          <Link to={`/groups/${groupId}/tasks`} className="text-primary-600 hover:underline mt-2 inline-block">
            Kembali ke daftar tugas
          </Link>
        </div>
      </Layout>
    )
  }

  const statusLabel = {
    todo: 'Belum Dikerjakan',
    in_progress: 'Sedang Dikerjakan',
    in_review: 'Dalam Review',
    done: 'Selesai',
  }

  const statusColor = {
    todo: 'default' as const,
    in_progress: 'warning' as const,
    in_review: 'info' as const,
    done: 'success' as const,
  }

  const priorityLabel = {
    low: 'Rendah',
    medium: 'Sedang',
    high: 'Tinggi',
  }

  return (
    <Layout>
      <div className="mb-6">
        <Link to={`/groups/${groupId}/tasks`} className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 mb-3">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Tugas
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{task.title}</h1>
            <p className="mt-1 text-slate-500">Dibuat pada {new Date(task.createdAt).toLocaleDateString('id-ID')}</p>
          </div>
          <Badge variant={statusColor[task.status]} size="md">
            {statusLabel[task.status]}
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Deskripsi">
            <p className="text-slate-700 whitespace-pre-line">{task.description}</p>
          </Card>

          <Card title="Riwayat Progres" description={`${taskProgress.length} pembaruan`}
            action={
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4" />
                Tambah Progres
              </Button>
            }
          >
            {taskProgress.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-sm">
                Belum ada pembaruan progres untuk tugas ini.
              </div>
            ) : (
              <ol className="relative border-l-2 border-slate-200 ml-3 space-y-6">
                {taskProgress.map((update) => (
                  <li key={update.id} className="ml-6">
                    <span className="absolute -left-2.5 flex items-center justify-center w-5 h-5 rounded-full bg-primary-100 ring-4 ring-white">
                      <span className="w-2 h-2 rounded-full bg-primary-600"></span>
                    </span>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-slate-900">{update.userName}</p>
                        <time className="text-xs text-slate-500">
                          {new Date(update.createdAt).toLocaleString('id-ID', { 
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
                          })}
                        </time>
                      </div>
                      <p className="text-sm text-slate-700 mb-2">{update.description}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                          <div 
                            className="bg-primary-600 h-1.5 rounded-full" 
                            style={{ width: `${update.progressPercentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium text-slate-600">{update.progressPercentage}%</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Detail Tugas">
            <dl className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <dt className="text-slate-500 text-xs">Penanggung Jawab</dt>
                  <dd className="text-slate-900 font-medium">{task.assigneeName}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <dt className="text-slate-500 text-xs">Tenggat Waktu</dt>
                  <dd className="text-slate-900 font-medium">
                    {new Date(task.deadline).toLocaleDateString('id-ID', { 
                      day: 'numeric', month: 'long', year: 'numeric' 
                    })}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Flag className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <dt className="text-slate-500 text-xs">Prioritas</dt>
                  <dd className="font-medium">
                    <span className={
                      task.priority === 'high' ? 'text-red-600' :
                      task.priority === 'medium' ? 'text-amber-600' : 'text-slate-600'
                    }>
                      {priorityLabel[task.priority]}
                    </span>
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <dt className="text-slate-500 text-xs">Status</dt>
                  <dd>
                    <Badge variant={statusColor[task.status]} size="sm">
                      {statusLabel[task.status]}
                    </Badge>
                  </dd>
                </div>
              </div>
            </dl>
          </Card>

          {task.assigneeId === 'user-1' && (
            <Card title="Aksi Cepat">
              <div className="space-y-2">
                <Button variant="outline" fullWidth size="sm">
                  Ubah Status
                </Button>
                <Button variant="outline" fullWidth size="sm">
                  <MessageSquare className="w-4 h-4" />
                  Tambah Progres
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  )
}