import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { ArrowLeft, Star, CheckCircle2, Lock } from 'lucide-react'
import { contributionPeriods, contributionVotes, members } from '../data/dummy'

export function EvaluationPage() {
  const { groupId } = useParams()
  const [selectedPeriod, setSelectedPeriod] = useState('period-2')
  
  const periods = contributionPeriods.filter(p => p.groupId === groupId)
  const currentPeriod = periods.find(p => p.id === selectedPeriod)
  const votes = contributionVotes.filter(v => v.periodId === selectedPeriod && v.voterId === 'user-1')
  
  const otherMembers = members.filter(m => m.id !== 'user-1')

  const getVoteForUser = (userId: string) => {
    return votes.find(v => v.targetUserId === userId)
  }

  return (
    <Layout>
      <div className="mb-6">
        <Link to={`/groups/${groupId}`} className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 mb-3">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Kelompok
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Evaluasi Kontribusi</h1>
        <p className="mt-1 text-slate-500">Beri penilaian terhadap kontribusi anggota kelompok.</p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Periode Evaluasi</label>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="w-full max-w-xs px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {periods.map((period) => (
            <option key={period.id} value={period.id}>
              {period.name} ({period.status === 'open' ? 'Terbuka' : 'Ditutup'})
            </option>
          ))}
        </select>
      </div>

      {currentPeriod?.status === 'closed' && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-900">Periode evaluasi telah ditutup</p>
            <p className="text-sm text-amber-700 mt-0.5">
              Anda tidak dapat mengubah penilaian pada periode ini.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {otherMembers.map((member) => {
          const existingVote = getVoteForUser(member.id)
          const isLocked = currentPeriod?.status === 'closed'
          
          return (
            <Card key={member.id}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-700 font-medium">{member.fullName.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{member.fullName}</h3>
                    <p className="text-sm text-slate-500">{member.studentId}</p>
                  </div>
                </div>
                {existingVote && (
                  <Badge variant="success" size="sm">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Dinilai
                  </Badge>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Skor Kontribusi (1-5)
                </label>
                <div className="flex items-center gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      disabled={isLocked}
                      className={`
                        p-2 rounded-lg transition-colors
                        ${existingVote?.score === score
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}
                        ${isLocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                      `}
                    >
                      <Star className={`w-5 h-5 ${existingVote?.score === score ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
                <textarea
                  disabled={isLocked}
                  placeholder="Catatan kriteria (opsional)..."
                  defaultValue={existingVote?.criteriaNotes || ''}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-slate-50 disabled:cursor-not-allowed"
                  rows={2}
                />
              </div>
            </Card>
          )
        })}
      </div>

      {currentPeriod?.status === 'open' && (
        <div className="mt-6 flex justify-end">
          <Button size="lg">
            Simpan Penilaian
          </Button>
        </div>
      )}
    </Layout>
  )
}