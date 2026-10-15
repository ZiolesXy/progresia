import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { ArrowLeft, Loader2, AlertCircle, User, CheckCircle2, TrendingUp, Printer, Download } from 'lucide-react'
import { supabase } from '../lib/supabase/client'
import { useAuth } from '../contexts/AuthContext'
import { EmptyState } from '../components/ui/EmptyState'

interface Period {
  id: string
  group_id: string
  title: string
  status: 'open' | 'closed' | 'finalized'
  opened_at: string | null
  closed_at: string | null
  created_at: string
}

interface Member {
  user_id: string
  profiles: { full_name: string; student_id: string; avatar_url: string | null } | null
}

interface EvalResult {
  target_id: string
  avg_score: number
  voter_count: number
}

interface LeaderReviewData {
  review_text: string
  adjusted_score: number | null
}

interface GroupInfo {
  name: string
  description: string | null
}

export function ReportPage() {
  const { groupId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [period, setPeriod] = useState<Period | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [evalResults, setEvalResults] = useState<Record<string, EvalResult>>({})
  const [leaderReviews, setLeaderReviews] = useState<Record<string, LeaderReviewData>>({})
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null)
  const [taskStats, setTaskStats] = useState({ total: 0, done: 0, overdue: 0 })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    if (!groupId || !user) return

    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        // 1. Ambil info kelompok
        const { data: groupData, error: groupError } = await supabase
          .from('groups')
          .select('name, description')
          .eq('id', groupId)
          .single()
        
        if (groupError) throw groupError
        if (groupData) {
          setGroupInfo(groupData as GroupInfo)
        }

        // 2. Ambil periode evaluasi terbaru
        const { data: periodData, error: periodError } = await supabase
          .from('contribution_periods')
          .select('*')
          .eq('group_id', groupId)
          .order('created_at', { ascending: false })
          .limit(1)

        if (periodError) throw periodError
        const currentPeriod = periodData && periodData.length > 0 ? (periodData[0] as Period) : null
        setPeriod(currentPeriod)

        // 3. Ambil daftar anggota
        const { data: membersData, error: membersError } = await supabase
          .from('group_members')
          .select(`user_id, profiles:user_id(full_name, student_id, avatar_url)`)
          .eq('group_id', groupId)

        if (membersError) throw membersError
        if (membersData) {
          const formattedMembers = membersData.map((m: any) => ({
            user_id: m.user_id,
            profiles: Array.isArray(m.profiles) ? m.profiles[0] : m.profiles
          }))
          setMembers(formattedMembers)
        }

        // 4. Hitung rata-rata nilai
        if (currentPeriod) {
          const { data: allVotes, error: votesError } = await supabase
            .from('contribution_votes')
            .select('target_id, score')
            .eq('period_id', currentPeriod.id)

          if (votesError) throw votesError
          const results: Record<string, EvalResult> = {}
          if (allVotes && Array.isArray(allVotes)) {
            const grouped = allVotes.reduce((acc: Record<string, { sum: number; count: number }>, vote: any) => {
              if (!acc[vote.target_id]) {
                acc[vote.target_id] = { sum: 0, count: 0 }
              }
              acc[vote.target_id].sum += Number(vote.score)
              acc[vote.target_id].count += 1
              return acc
            }, {})

            for (const [target_id, val] of Object.entries(grouped)) {
              results[target_id] = {
                target_id,
                avg_score: Math.round((val.sum / val.count) * 100) / 100,
                voter_count: val.count
              }
            }
          }
          setEvalResults(results)

          // 5. Ambil review ketua
          const { data: reviews, error: reviewsError } = await supabase
            .from('contribution_reviews')
            .select('target_id, review_text, adjusted_score')
            .eq('period_id', currentPeriod.id)
          
          if (reviewsError) throw reviewsError
          if (reviews) {
            const reviewsMap: Record<string, LeaderReviewData> = {}
            reviews.forEach((r: any) => {
              reviewsMap[r.target_id] = { 
                review_text: r.review_text || '', 
                adjusted_score: r.adjusted_score 
              }
            })
            setLeaderReviews(reviewsMap)
          }

          // 6. Hitung statistik tugas
          const { data: tasksData, error: tasksError } = await supabase
            .from('tasks')
            .select('status, deadline')
            .eq('group_id', groupId)
          
          if (tasksError) throw tasksError
          if (tasksData) {
            const total = tasksData.length
            const done = tasksData.filter(t => t.status === 'done').length
            const now = new Date()
            const overdue = tasksData.filter(t => 
              t.status !== 'done' && t.deadline && new Date(t.deadline) < now
            ).length
            setTaskStats({ total, done, overdue })
          }
        }
      } catch (err: any) {
        setError(err.message || 'Gagal memuat data laporan')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [groupId, user])

  const getFinalScore = (memberId: string): number => {
    const review = leaderReviews[memberId]
    const result = evalResults[memberId]
    if (review?.adjusted_score !== null && review?.adjusted_score !== undefined) {
      return review.adjusted_score
    }
    return result ? result.avg_score : 0
  }

  const getGrade = (score: number): string => {
    if (score >= 85) return 'A'
    if (score >= 70) return 'B'
    if (score >= 60) return 'C'
    return 'D'
  }

  const getGradeColor = (grade: string): string => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800 border-green-200'
      case 'B': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'C': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-red-100 text-red-800 border-red-200'
    }
  }

  const handlePrint = () => {
    window.print()
  }

  // FUNGSI EKSPOR PDF YANG BENAR-BENAR BERFUNGSI
  const handleExportPDF = async () => {
    if (!period || !groupInfo) {
      setError('Data tidak lengkap untuk mengekspor PDF.')
      return
    }

    setExporting(true)
    setError(null)

    try {
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
      ])

      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      
      // Header
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text('LAPORAN KONTRIBUSI KELOMPOK', pageWidth / 2, 20, { align: 'center' })
      
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text(groupInfo.name, pageWidth / 2, 30, { align: 'center' })
      
      doc.setFontSize(10)
      doc.text(`Periode: ${period.title}`, pageWidth / 2, 38, { align: 'center' })
      doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, pageWidth / 2, 44, { align: 'center' })
      
      // Statistik Ringkas
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('Ringkasan:', 14, 58)
      
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.text(`Total Anggota: ${members.length}`, 14, 65)
      doc.text(`Tugas Selesai: ${taskStats.done}/${taskStats.total}`, 14, 71)
      doc.text(`Tugas Terlambat: ${taskStats.overdue}`, 14, 77)
      
      const avgScore = members.length > 0 
        ? Math.round(members.reduce((sum, m) => sum + getFinalScore(m.user_id), 0) / members.length * 100) / 100
        : 0
      doc.text(`Rata-rata Skor Kelompok: ${avgScore.toFixed(2)}`, 14, 83)
      
      // Tabel Nilai Anggota
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('Detail Nilai Anggota:', 14, 95)
      
      const tableData = members.map((member, index) => {
        const result = evalResults[member.user_id]
        const review = leaderReviews[member.user_id]
        const finalScore = getFinalScore(member.user_id)
        const grade = getGrade(finalScore)
        const initialScore = result ? result.avg_score.toFixed(2) : '-'
        
        return [
          index + 1,
          member.profiles?.full_name || 'Anggota',
          member.profiles?.student_id || '-',
          initialScore,
          finalScore.toFixed(2),
          grade,
          review?.review_text || 'Tidak ada catatan'
        ]
      })
      
      autoTable(doc, {
        startY: 100,
        head: [['No', 'Nama', 'NIM', 'Nilai Awal', 'Nilai Akhir', 'Grade', 'Catatan']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 40 },
          2: { cellWidth: 25 },
          3: { cellWidth: 20, halign: 'center' },
          4: { cellWidth: 20, halign: 'center' },
          5: { cellWidth: 15, halign: 'center' },
          6: { cellWidth: 55 }
        }
      })
      
      // Footer
      const finalY = (doc as any).lastAutoTable.finalY || 150
      doc.setFontSize(9)
      doc.setFont('helvetica', 'italic')
      doc.text('Catatan: Nilai akhir merupakan kombinasi dari penilaian antarteman dan review ketua.', 14, finalY + 15)
      doc.text('Laporan ini digenerate otomatis oleh sistem Progresia.', 14, finalY + 20)
      
      // Simpan PDF
      const fileName = `Laporan_${groupInfo.name.replace(/\s+/g, '_')}_${period.title.replace(/\s+/g, '_')}.pdf`
      doc.save(fileName)
      
    } catch (err: any) {
      console.error('PDF Export Error:', err)
      setError(err.message || 'Gagal mengekspor PDF')
    } finally {
      setExporting(false)
    }
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

  const avgScore = members.length > 0 
    ? Math.round(members.reduce((sum, m) => sum + getFinalScore(m.user_id), 0) / members.length * 100) / 100
    : 0

  return (
    <Layout>
      <div className="mb-6 px-4 sm:px-0 print:mb-4">
        <button onClick={() => navigate(`/groups/${groupId}`)} className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 mb-3 print:hidden">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Kelompok
        </button>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-900">Laporan Kontribusi</h1>
            <p className="mt-1 text-sm text-slate-500 break-words">
              {period ? `Periode: ${period.title}` : 'Belum ada periode evaluasi'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 print:hidden">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" /> Cetak
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportPDF}
              isLoading={exporting}
            >
              <Download className="w-4 h-4 mr-2" /> Ekspor PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-0 space-y-6 print:space-y-4">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /><span>{error}</span>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{members.length}</p>
                <p className="text-xs text-slate-500">Total Anggota</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{taskStats.done}/{taskStats.total}</p>
                <p className="text-xs text-slate-500">Tugas Selesai</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{avgScore.toFixed(2)}</p>
                <p className="text-xs text-slate-500">Rata-rata Skor</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabel Ringkasan Nilai */}
        <Card title="Ringkasan Nilai Akhir" description="Berdasarkan evaluasi antarteman dan review ketua">
          {period && members.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-2 font-medium text-slate-600">Anggota</th>
                    <th className="text-center py-3 px-2 font-medium text-slate-600">Nilai Awal</th>
                    <th className="text-center py-3 px-2 font-medium text-slate-600">Nilai Akhir</th>
                    <th className="text-left py-3 px-2 font-medium text-slate-600">Alasan Perubahan</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => {
                    const result = evalResults[member.user_id]
                    const review = leaderReviews[member.user_id]
                    const finalScore = getFinalScore(member.user_id)
                    const grade = getGrade(finalScore)
                    const hasAdjustment = review?.adjusted_score !== null && review?.adjusted_score !== undefined
                    
                    return (
                      <tr key={member.user_id} className="border-b border-slate-100 last:border-0">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            {member.profiles?.avatar_url ? (
                              <img
                                src={member.profiles.avatar_url}
                                alt={member.profiles?.full_name || 'Avatar'}
                                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-medium text-primary-600">
                                  {member.profiles?.full_name?.charAt(0) || '?'}
                                </span>
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-medium text-slate-900 break-words">{member.profiles?.full_name || 'Anggota'}</p>
                              <p className="text-xs text-slate-500 break-words">{member.profiles?.student_id || '-'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className="font-medium text-slate-700">
                            {result ? result.avg_score.toFixed(2) : '-'}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <Badge className={getGradeColor(grade)} size="sm">
                            {finalScore.toFixed(2)}
                          </Badge>
                        </td>
                        <td className="py-3 px-2">
                          <p className="text-xs text-slate-600 break-words">
                            {review?.review_text || (hasAdjustment ? 'Disesuaikan oleh ketua.' : 'Tidak ada perubahan, nilai rata-rata sudah adil.')}
                          </p>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={User}
              title="Belum ada data"
              description={period ? 'Belum ada anggota kelompok untuk ditampilkan.' : 'Belum ada periode evaluasi untuk ditampilkan.'}
            />
          )}
        </Card>

        {/* Catatan */}
        <Card title="Catatan Penting">
          <div className="flex items-start gap-2 text-sm text-slate-600">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p>
              Nilai akhir merupakan kombinasi dari penilaian antarteman (subjektif) dan review ketua berdasarkan bukti pekerjaan (faktual). 
              Skor ini bukan ukuran objektif sempurna atas kerja seseorang.
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  )
}
