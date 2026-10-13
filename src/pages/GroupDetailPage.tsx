import { useParams, Link, useNavigate } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Crown, ArrowLeft, Copy, CheckCircle2, Loader2, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase/client'
import { useAuth } from '../contexts/AuthContext'
import { ResetPinModal } from '../components/ResetPinModal'

interface Group {
  id: string
  name: string
  course_name: string
  description: string | null
  capacity: number
  invite_code: string
  leader_id: string
  created_at: string
}

interface Member {
  id: string
  user_id: string
  role: string
  profiles: {
    full_name: string
    student_id: string
  }
}

export function GroupDetailPage() {
  const { groupId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [group, setGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [showResetPinModal, setShowResetPinModal] = useState(false)

  useEffect(() => {
    if (!groupId || !user) return

    const fetchData = async () => {
      setLoading(true)

      // Ambil data kelompok
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single()

      if (groupError || !groupData) {
        setLoading(false)
        return
      }

      setGroup(groupData)

      // Ambil anggota kelompok + profil
      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select(`
          id,
          user_id,
          role,
          profiles:user_id (full_name, student_id)
        `)
        .eq('group_id', groupId)

      if (!membersError && membersData) {
        setMembers(membersData as unknown as Member[])
      }

      setLoading(false)
    }

    fetchData()
  }, [groupId, user])

  const handleCopyCode = () => {
    if (group?.invite_code) {
      navigator.clipboard.writeText(group.invite_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const isLeader = group?.leader_id === user?.id

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
      </Layout>
    )
  }

  if (!group) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-slate-500 mb-4">Kelompok tidak ditemukan atau Anda tidak memiliki akses.</p>
          <Link to="/groups" className="text-primary-600 hover:underline">
            Kembali ke daftar kelompok
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="mb-6">
        <button
          onClick={() => navigate('/groups')}
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Kelompok
        </button>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{group.name}</h1>
            <p className="mt-1 text-slate-500">{group.course_name}</p>
          </div>
          <Badge variant={isLeader ? 'info' : 'default'} size="md">
            {isLeader ? 'Anda Ketua' : 'Anggota'}
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card title="Informasi Kelompok">
            <dl className="space-y-3 text-sm">
              {group.description && (
                <div>
                  <dt className="text-slate-500">Deskripsi</dt>
                  <dd className="text-slate-900 mt-0.5">{group.description}</dd>
                </div>
              )}
              <div>
                <dt className="text-slate-500">Kapasitas</dt>
                <dd className="text-slate-900 mt-0.5">{members.length} / {group.capacity} anggota</dd>
              </div>
              <div>
                <dt className="text-slate-500">Dibuat pada</dt>
                <dd className="text-slate-900 mt-0.5">
                  {new Date(group.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </dd>
              </div>
            </dl>
          </Card>

          {isLeader && (
            <Card title="Kode Undangan">
              <p className="text-sm text-slate-500 mb-3">
                Bagikan kode ini beserta PIN kepada anggota yang ingin bergabung.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono text-slate-900">
                  {group.invite_code}
                </code>
                <Button variant="outline" size="sm" onClick={handleCopyCode}>
                  {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Tersalin' : 'Salin'}
                </Button>
              </div>

              {/* Tombol Reset PIN */}
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500 mb-2">Lupa PIN atau ingin mengganti?</p>
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => setShowResetPinModal(true)}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset PIN Undangan
                </Button>
              </div>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card title="Anggota Kelompok" description={`${members.length} orang`}>
            <ul className="divide-y divide-slate-100">
              {members.map((member) => (
                <li key={member.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-700 font-medium text-sm">
                        {member.profiles.full_name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{member.profiles.full_name}</p>
                      <p className="text-xs text-slate-500">{member.profiles.student_id}</p>
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

          <Card title="Aksi Kelompok">
            <div className="space-y-2">
              <Button
                variant="outline"
                fullWidth
                size="sm"
                onClick={() => navigate(`/groups/${groupId}/tasks`)}
              >
                Lihat Daftar Tugas
              </Button>
              <Button
                variant="outline"
                fullWidth
                size="sm"
                onClick={() => navigate(`/groups/${groupId}/evaluation`)}
              >
                Evaluasi Kontribusi
              </Button>
              <Button
                variant="outline"
                fullWidth
                size="sm"
                onClick={() => navigate(`/groups/${groupId}/report`)}
              >
                Lihat Laporan
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <ResetPinModal
        isOpen={showResetPinModal}
        groupId={groupId!}
        onClose={() => setShowResetPinModal(false)}
      />
    </Layout>
  )
}