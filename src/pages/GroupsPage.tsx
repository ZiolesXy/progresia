import { Layout } from '../components/layout/Layout'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Plus, Users } from 'lucide-react'
import { groups } from '../data/dummy'

export function GroupsPage() {
  return (
    <Layout>
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kelompok Saya</h1>
          <p className="mt-1 text-slate-500">Daftar kelompok yang Anda ikuti.</p>
        </div>
        <Button>
          <Plus className="w-4 h-4" />
          Buat Kelompok
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group) => (
          <Card key={group.id} className="hover:border-slate-300 transition-colors cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary-600" />
              </div>
              {group.leaderId === 'user-1' && <Badge variant="info" size="sm">Ketua</Badge>}
            </div>
            <h3 className="font-semibold text-slate-900">{group.name}</h3>
            <p className="text-sm text-slate-500 mt-0.5">{group.courseName}</p>
            <p className="text-sm text-slate-600 mt-3 line-clamp-2">{group.description}</p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
              <span className="text-slate-500">{group.memberCount}/{group.capacity} anggota</span>
              <span className="text-slate-400 text-xs">
                Bergabung {new Date(group.createdAt).toLocaleDateString('id-ID')}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </Layout>
  )
}