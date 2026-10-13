import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Plus, Users, Loader2 } from 'lucide-react'
import { useGroups } from '../hooks/useGroups'
import { CreateGroupModal } from '../components/CreateGroupModal'
import { JoinGroupModal } from '../components/JoinGroupModal'

export function GroupsPage() {
  const navigate = useNavigate()
  const { groups, loading, error } = useGroups()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)

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
          <h1 className="text-2xl font-bold text-slate-900">Kelompok Saya</h1>
          <p className="mt-1 text-slate-500">
            {groups.length === 0
              ? 'Anda belum bergabung dengan kelompok manapun.'
              : `${groups.length} kelompok yang Anda ikuti.`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowJoinModal(true)}>
            Gabung Kelompok
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4" />
            Buat Kelompok
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {groups.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Belum ada kelompok</h3>
            <p className="text-sm text-slate-500 mb-4">
              Buat kelompok baru atau gabung dengan kelompok yang sudah ada.
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => setShowJoinModal(true)}>
                Gabung Kelompok
              </Button>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4" />
                Buat Kelompok
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <Card
              key={group.id}
              className="hover:border-slate-300 transition-colors cursor-pointer"
              onClick={() => navigate(`/groups/${group.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary-600" />
                </div>
                {group.is_leader && <Badge variant="info" size="sm">Ketua</Badge>}
              </div>
              <h3 className="font-semibold text-slate-900">{group.name}</h3>
              <p className="text-sm text-slate-500 mt-0.5">{group.course_name}</p>
              {group.description && (
                <p className="text-sm text-slate-600 mt-3 line-clamp-2">{group.description}</p>
              )}
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  {group.member_count || 0}/{group.capacity} anggota
                </span>
                <span className="text-slate-400 text-xs">
                  {new Date(group.created_at).toLocaleDateString('id-ID')}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <CreateGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      <JoinGroupModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
      />
    </Layout>
  )
}