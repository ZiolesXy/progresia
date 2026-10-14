import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { Users, CheckCircle2, Clock, AlertCircle, Loader2, ClipboardList } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase/client'

interface Profile {
  full_name: string | null
  student_id: string | null
}

interface GroupSummary {
  id: string
  name: string
  course_name: string
  capacity: number
  created_at: string
  member_count: number
}

interface TaskSummary {
  id: string
  title: string
  deadline: string | null
  priority: 'low' | 'medium' | 'high'
  status: 'todo' | 'in_progress' | 'in_review' | 'done'
  assignee: { full_name: string | null } | null
}

export function HomePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [groups, setGroups] = useState<GroupSummary[]>([])
  const [tasks, setTasks] = useState<TaskSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      // oxlint-disable react/set-state-in-effect
      setLoading(false)
      return
    }

    const fetchDashboardData = async () => {
      setLoading(true)
      setError(null)

      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, student_id')
          .eq('id', user.id)
          .single()

        if (profileError) throw profileError
        setProfile(profileData)

        const { data: memberships, error: membershipError } = await supabase
          .from('group_members')
          .select('group_id')
          .eq('user_id', user.id)

        if (membershipError) throw membershipError

        const groupIds = (memberships || []).map((membership: any) => membership.group_id)
        if (groupIds.length === 0) {
          setGroups([])
          setTasks([])
          return
        }

        const { data: groupsData, error: groupsError } = await supabase
          .from('groups')
          .select('id, name, course_name, capacity, created_at')
          .in('id', groupIds)
          .order('created_at', { ascending: false })

        if (groupsError) throw groupsError

        const groupsWithCounts = await Promise.all(
          (groupsData || []).map(async (group: any) => {
            const { count, error: countError } = await supabase
              .from('group_members')
              .select('*', { count: 'exact', head: true })
              .eq('group_id', group.id)

            if (countError) throw countError
            return { ...group, member_count: count || 0 }
          })
        )

        setGroups(groupsWithCounts)

        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('id, title, deadline, priority, status, assignee:assignee_id(full_name)')
          .in('group_id', groupIds)
          .order('deadline', { ascending: true, nullsFirst: false })

        if (tasksError) throw tasksError

        const formattedTasks = (tasksData || []).map((task: any) => ({
          ...task,
          assignee: Array.isArray(task.assignee) ? task.assignee[0] : task.assignee,
        }))

        setTasks(formattedTasks)
      } catch (err: any) {
        setError(err.message || 'Gagal memuat ringkasan aktivitas. Silakan coba lagi nanti.')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user])

  const firstName = profile?.full_name?.split(' ')[0] || 'User'

  const upcomingTasks = useMemo(
    () => tasks.filter((task) => task.status !== 'done').slice(0, 4),
    [tasks]
  )

  const stats = [
    { label: 'Kelompok Aktif', value: groups.length, icon: Users, color: 'text-primary-600 bg-primary-50' },
    { label: 'Tugas Selesai', value: tasks.filter(t => t.status === 'done').length, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Sedang Dikerjakan', value: tasks.filter(t => t.status === 'in_progress').length, icon: Clock, color: 'text-amber-600 bg-amber-50' },
    { label: 'Belum Dimulai', value: tasks.filter(t => t.status === 'todo').length, icon: AlertCircle, color: 'text-slate-600 bg-slate-100' },
  ]

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 break-words">Selamat datang, {firstName}</h1>
        <p className="mt-1 text-slate-500">Ringkasan aktivitas kelompok Anda.</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500 break-words">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Tugas Mendatang" description="Tenggat terdekat">
          {upcomingTasks.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="Belum ada data"
              description="Tugas yang belum selesai akan muncul di sini."
            />
          ) : (
            <ul className="space-y-3">
              {upcomingTasks.map((task) => (
                <li key={task.id} className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 py-2 border-b border-slate-100 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 break-words">{task.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 break-words">
                      {task.assignee?.full_name || 'Belum diassign'} · {task.deadline ? new Date(task.deadline).toLocaleDateString('id-ID') : 'Tanpa tenggat'}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 self-start ${task.priority === 'high' ? 'bg-red-50 text-red-700' :
                    task.priority === 'medium' ? 'bg-amber-50 text-amber-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                    {task.priority === 'high' ? 'Tinggi' : task.priority === 'medium' ? 'Sedang' : 'Rendah'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Kelompok Saya">
          {groups.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Belum ada data"
              description="Anda belum bergabung dengan kelompok manapun."
            />
          ) : (
            <ul className="space-y-3">
              {groups.map((group) => (
                <li key={group.id} className="py-2 border-b border-slate-100 last:border-0">
                  <Link to={`/groups/${group.id}`} className="block hover:bg-slate-50 -mx-2 px-2 py-1 rounded transition-colors">
                    <p className="text-sm font-medium text-slate-900 break-words">{group.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5 break-words">
                      {group.course_name} · {group.member_count}/{group.capacity} anggota
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </Layout>
  )
}
