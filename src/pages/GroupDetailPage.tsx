import { useParams, Link } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Users, Crown, ArrowLeft, Copy, CheckCircle2 } from 'lucide-react'
import { groups, members, tasks } from '../data/dummy'
import { useState } from 'react'

export function GroupDetailPage() {
  const { groupId } = useParams()
  const [copied, setCopied] = useState(false)
  
  const group = groups.find(g => g.id === groupId)
  const groupMembers = members
  const groupTasks = tasks.filter(t => t.groupId === groupId)

  if (!group) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-slate-500">Kelompok tidak ditemukan.</p>
          <Link to="/groups" className="text-primary-600 hover:underline mt-2 inline-block">
            Kembali ke daftar kelompok
          </Link>
        </div>
      </Layout>
    )
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(group.inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Layout>
      <div className="mb-6">
        <Link to="/groups" className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 mb-3">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Kelompok
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{group.name}</h1>
            <p className="mt-1 text-slate-500">{group.courseName}</p>
          </div>
          <Badge variant={group.leaderId === 'user-1' ? 'info' : 'default'} size="md">
            {group.leaderId === 'user-1' ? 'Anda Ketua' : 'Anggota'}
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Kolom kiri: Info & Kode Undangan */}
        <div className="space-y-6">
          <Card title="Informasi Kelompok">
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-slate-500">Deskripsi</dt>
                <dd className="text-slate-900 mt-0.5">{group.description}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Kapasitas</dt>
                <dd className="text-slate-900 mt-0.5">{group.memberCount} / {group.capacity} anggota</dd>
              </div>
              <div>
                <dt className="text-slate-500">Dibuat pada</dt>
                <dd className="text-slate-900 mt-0.5">
                  {new Date(group.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </dd>
              </div>
            </dl>
          </Card>
                    <Card title="Aksi Kelompok">
            <div className="space-y-2">
              <Button 
                variant="outline" 
                fullWidth 
                size="sm"
                onClick={() => window.location.href = `/groups/${groupId}/tasks`}
              >
                Lihat Daftar Tugas
              </Button>
              <Button 
                variant="outline" 
                fullWidth 
                size="sm"
                onClick={() => window.location.href = `/groups/${groupId}/evaluation`}
              >
                Evaluasi Kontribusi
              </Button>
              <Button 
                variant="outline" 
                fullWidth 
                size="sm"
                onClick={() => window.location.href = `/groups/${groupId}/report`}
              >
                Lihat Laporan
              </Button>
            </div>
          </Card>

          {group.leaderId === 'user-1' && (
            <Card title="Kode Undangan">
              <p className="text-sm text-slate-500 mb-3">
                Bagikan kode ini beserta PIN kepada anggota yang ingin bergabung.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono text-slate-900">
                  {group.inviteCode}
                </code>
                <Button variant="outline" size="sm" onClick={handleCopyCode}>
                  {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Tersalin' : 'Salin'}
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Kolom kanan: Anggota & Tugas */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Anggota Kelompok" description={`${groupMembers.length} orang`}
            action={
              group.leaderId === 'user-1' && (
                <Button variant="outline" size="sm">
                  <Users className="w-4 h-4" />
                  Kelola
                </Button>
              )
            }
          >
            <ul className="divide-y divide-slate-100">
              {groupMembers.map((member) => (
                <li key={member.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-700 font-medium text-sm">
                        {member.fullName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{member.fullName}</p>
                      <p className="text-xs text-slate-500">{member.studentId}</p>
                    </div>
                  </div>
                  {member.role === 'leader' ? (
                    <Badge variant="info" size="sm">
                      <Crown className="w-3 h-3 mr-1" />
                      Ketua
                    </Badge>
                  ) : (
                    <Badge variant="default" size="sm">Anggota</Badge>
                  )}
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Daftar Tugas" description={`${groupTasks.length} tugas`}
            action={
              group.leaderId === 'user-1' && (
                <Button variant="outline" size="sm">
                  Tambah Tugas
                </Button>
              )
            }
          >
            <ul className="divide-y divide-slate-100">
              {groupTasks.map((task) => (
                <li key={task.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link to={`/groups/${groupId}/tasks/${task.id}`} className="text-sm font-medium text-slate-900 hover:text-primary-600 truncate block">
                      {task.title}
                    </Link>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {task.assigneeName} · {new Date(task.deadline).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant={
                      task.status === 'done' ? 'success' :
                      task.status === 'in_progress' ? 'warning' :
                      task.status === 'in_review' ? 'info' : 'default'
                    } size="sm">
                      {task.status === 'done' ? 'Selesai' :
                       task.status === 'in_progress' ? 'Dikerjakan' :
                       task.status === 'in_review' ? 'Review' : 'Belum'}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </Layout>
  )
}