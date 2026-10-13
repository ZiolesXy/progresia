import { Link } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { Card } from '../components/ui/Card'
import { Users, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { groups, tasks } from '../data/dummy'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase/client'

interface Profile {
  full_name: string
  student_id: string
}

export function HomePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)

  // Ambil nama user yang login dari tabel profiles
  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, student_id')
          .eq('id', user.id)
          .single()

        if (!error && data) {
          setProfile(data)
        }
      }
      fetchProfile()
    }
  }, [user])

  const firstName = profile?.full_name?.split(' ')[0] || 'User'

  const stats = [
    { label: 'Kelompok Aktif', value: groups.length, icon: Users, color: 'text-primary-600 bg-primary-50' },
    { label: 'Tugas Selesai', value: tasks.filter(t => t.status === 'done').length, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Sedang Dikerjakan', value: tasks.filter(t => t.status === 'in_progress').length, icon: Clock, color: 'text-amber-600 bg-amber-50' },
    { label: 'Belum Dimulai', value: tasks.filter(t => t.status === 'todo').length, icon: AlertCircle, color: 'text-slate-600 bg-slate-100' },
  ]

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Selamat datang, {firstName}</h1>
        <p className="mt-1 text-slate-500">Ringkasan aktivitas kelompok Anda.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Tugas Mendatang" description="Tenggat terdekat">
          <ul className="space-y-3">
            {tasks
              .filter(t => t.status !== 'done')
              .slice(0, 4)
              .map((task) => (
                <li key={task.id} className="flex items-start justify-between gap-3 py-2 border-b border-slate-100 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{task.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {task.assigneeName} · {new Date(task.deadline).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${task.priority === 'high' ? 'bg-red-50 text-red-700' :
                      task.priority === 'medium' ? 'bg-amber-50 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                    }`}>
                    {task.priority === 'high' ? 'Tinggi' : task.priority === 'medium' ? 'Sedang' : 'Rendah'}
                  </span>
                </li>
              ))}
          </ul>
        </Card>

        <Card title="Kelompok Saya">
          {groups.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-sm">
              Anda belum bergabung dengan kelompok manapun.
            </div>
          ) : (
            <ul className="space-y-3">
              {groups.map((group) => (
                <li key={group.id} className="py-2 border-b border-slate-100 last:border-0">
                  <Link to={`/groups/${group.id}`} className="block hover:bg-slate-50 -mx-2 px-2 py-1 rounded transition-colors">
                    <p className="text-sm font-medium text-slate-900">{group.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {group.courseName} · {group.memberCount}/{group.capacity} anggota
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