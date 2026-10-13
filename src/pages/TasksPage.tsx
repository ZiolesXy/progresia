import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Plus, Filter, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { tasks as allTasks } from '../data/dummy'

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
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const groupTasks = allTasks.filter(t => t.groupId === groupId)
  const filteredTasks = statusFilter === 'all'
    ? groupTasks
    : groupTasks.filter(t => t.status === statusFilter)

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

  return (
    <Layout>
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Daftar Tugas</h1>
          <p className="mt-1 text-slate-500">
            {filteredTasks.length} dari {groupTasks.length} tugas
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4" />
          Tambah Tugas
        </Button>
      </div>

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
          <div className="text-center py-8 text-slate-500 text-sm">
            Tidak ada tugas dengan status ini.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filteredTasks.map((task) => {
              const Icon = statusIcon[task.status as keyof typeof statusIcon]
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
                          <Badge variant={statusColor[task.status as keyof typeof statusColor]} size="sm">
                            <Icon className="w-3 h-3 mr-1" />
                            {statusLabel[task.status as keyof typeof statusLabel]}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2 mb-2">{task.description}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                          <span>👤 {task.assigneeName}</span>
                          <span>📅 {new Date(task.deadline).toLocaleDateString('id-ID')}</span>
                          <span className={`font-medium ${task.priority === 'high' ? 'text-red-600' :
                              task.priority === 'medium' ? 'text-amber-600' : 'text-slate-500'
                            }`}>
                            Prioritas: {priorityLabel[task.priority as keyof typeof priorityLabel]}
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
    </Layout>
  )
}