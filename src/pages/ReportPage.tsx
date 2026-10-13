import { useParams, Link } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { ArrowLeft, Download, Printer, TrendingUp, Users, CheckCircle2, FileText } from 'lucide-react'
import { contributionReviews, members, tasks } from '../data/dummy'

export function ReportPage() {
  const { groupId } = useParams()
  
  const groupMembers = members
  const reviews = contributionReviews.filter(r => r.periodId === 'period-1')
  const completedTasks = tasks.filter(t => t.groupId === groupId && t.status === 'done').length
  const totalTasks = tasks.filter(t => t.groupId === groupId).length

  return (
    <Layout>
      <div className="mb-6">
        <Link to={`/groups/${groupId}`} className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 mb-3">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Kelompok
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Laporan Kontribusi</h1>
            <p className="mt-1 text-slate-500">Periode: Evaluasi Minggu 1</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Printer className="w-4 h-4" />
              Cetak
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4" />
              Ekspor PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-900">{groupMembers.length}</p>
              <p className="text-xs text-slate-500">Total Anggota</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-900">{completedTasks}/{totalTasks}</p>
              <p className="text-xs text-slate-500">Tugas Selesai</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-900">4.04</p>
              <p className="text-xs text-slate-500">Rata-rata Skor</p>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Ringkasan Nilai Akhir" description="Berdasarkan evaluasi antarteman dan review ketua">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-2 font-medium text-slate-600">Anggota</th>
                <th className="text-center py-3 px-2 font-medium text-slate-600">Nilai Awal</th>
                <th className="text-center py-3 px-2 font-medium text-slate-600">Nilai Akhir</th>
                <th className="text-left py-3 px-2 font-medium text-slate-600">Alasan Perubahan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {groupMembers.map((member) => {
                const review = reviews.find(r => r.targetUserId === member.id)
                const scoreDiff = review ? review.finalScore - review.initialScore : 0
                
                return (
                  <tr key={member.id}>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-700 font-medium text-xs">
                            {member.fullName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{member.fullName}</p>
                          <p className="text-xs text-slate-500">{member.studentId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="font-medium text-slate-700">
                        {review ? review.initialScore.toFixed(2) : '-'}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <Badge variant={
                        !review ? 'default' :
                        scoreDiff > 0 ? 'success' :
                        scoreDiff < 0 ? 'danger' : 'info'
                      } size="sm">
                        {review ? review.finalScore.toFixed(2) : '-'}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-slate-600 text-xs">
                      {review?.reason || '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-900">Catatan Penting</p>
          <p className="text-sm text-blue-700 mt-0.5">
            Nilai akhir merupakan kombinasi dari penilaian antarteman (subjektif) dan review ketua berdasarkan bukti pekerjaan (faktual). 
            Skor ini bukan ukuran objektif sempurna atas kerja seseorang.
          </p>
        </div>
      </div>
    </Layout>
  )
}