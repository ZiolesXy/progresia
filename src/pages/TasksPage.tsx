import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Plus, Filter, Clock, CheckCircle2, AlertCircle, Loader2, Users, Lock } from 'lucide-react'
import { useTasks } from '../hooks/useTasks'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase/client'
import { CreateTaskModal } from '../components/CreateTaskModal'

type StatusFilter = 'all' | 'todo' | 'in_progress' | 'in_review' | 'done'

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'todo', label: 'Belum Dikerjakan' },
  { value: 'in_progress', label: 'Sedang Dikerjakan' },
  { value: 'in_review', label: 'Dalam Review' },
  { value: 'done', label: 'Selesai' },
]

export function TasksPage() {
  const { groupId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { tasks, loading, error } = useTasks(groupId)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [isLeader, setIsLeader] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Cek apakah user adalah ketua kelompok
  useEffect(() => {
    if (!groupId || !user) return

    const checkLeader = async () => {
      const { data, error } = await supabase
        .from('group_members')
        .select('role')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single()

      if (!error && data) {
        setIsLeader(data.role === 'leader')
      }
    }

    checkLeader()
  }, [groupId, user])

  const filteredTasks = statusFilter === 'all' 
    ? tasks 
    : tasks.filter(t => t.status === statusFilter)

  const statusIcon = {
    todo: AlertCircle,
    in_progress: Loader2,
    in_review: Clock,
    done: CheckCircle2,
  }

  const statusColor = {
    todo: 'default' as const,
    in_progress: 'warning' as const,
    in_review: 'info' as const,
    done: 'success' as const,
  }

  const statusLabel = {
    todo: 'Belum Dikerjakan',
    in_progress: 'Sedang Dikerjakan',
    in_review: 'Dalam Review',
    done: 'Selesai',
  }

  const priorityLabel = {
    low: 'Rendah',
    medium: 'Sedang',
    high: 'Tinggi',
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Daftar Tugas</h1>
          <p className="mt-1 text-slate-500">
            {filteredTasks.length} dari {tasks.length} tugas
          </p>
        </div>
        {isLeader ? (
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4" />
            Tambah Tugas
          </Button>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg text-sm text-slate-600">
            <Lock className="w-4 h-4" />
            Hanya ketua yang bisa menambah tugas
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <Card>
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                ${statusFilter === option.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
              `}
            >
              {option.label}
            </button>
          ))}
        </div>

        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">
              {tasks.length === 0 ? 'Belum ada tugas di kelompok ini.' : 'Tidak ada tugas dengan status ini.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filteredTasks.map((task) => {
              const Icon = statusIcon[task.status]
              return (
                <li key={task.id} className="py-4 cursor-pointer">
                  <div 
                    onClick={() => navigate(`/groups/${groupId}/tasks/${task.id}`)}
                    className="block hover:bg-slate-50 -mx-5 px-5 py-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-semibold text-slate-900 truncate">
                            {task.title}
                          </h3>
                          <Badge variant={statusColor[task.status]} size="sm">
                            <Icon className="w-3 h-3 mr-1" />
                            {statusLabel[task.status]}
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-sm text-slate-600 line-clamp-2 mb-2">{task.description}</p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                          {task.assignee ? (
                            <span>👤 {task.assignee.full_name}</span>
                          ) : (
                            <span className="text-amber-600">👤 Belum diassign</span>
                          )}
                          {task.deadline && (
                            <span>📅 {new Date(task.deadline).toLocaleDateString('id-ID')}</span>
                          )}
                          <span className={`font-medium ${
                            task.priority === 'high' ? 'text-red-600' :
                            task.priority === 'medium' ? 'text-amber-600' : 'text-slate-500'
                          }`}>
                            Prioritas: {priorityLabel[task.priority]}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Card>

      <CreateTaskModal
        isOpen={showCreateModal}
        groupId={groupId!}
        onClose={() => setShowCreateModal(false)}
      />
    </Layout>
  )
}