export const currentUser = {
  id: 'user-1',
  fullName: 'Pasha Prabasakti',
  studentId: '15260786',
  email: 'pashaprabasakti@gmail.com',
  avatarUrl: null,
}

export const groups = [
  {
    id: 'group-1',
    name: 'Kelompok Alpha',
    courseName: 'Rekayasa Perangkat Lunak',
    description: 'Kelompok untuk proyek akhir RPL semester ini.',
    capacity: 5,
    memberCount: 4,
    inviteCode: 'abc-123-def',
    leaderId: 'user-1',
    createdAt: '2025-01-15T08:00:00Z',
  },
  {
    id: 'group-2',
    name: 'Tim Beta',
    courseName: 'Basis Data Lanjut',
    description: 'Proyek desain database untuk sistem perpustakaan.',
    capacity: 4,
    memberCount: 3,
    inviteCode: 'xyz-789-ghi',
    leaderId: 'user-2',
    createdAt: '2025-02-01T10:30:00Z',
  },
]

export const members = [
  { id: 'user-1', fullName: 'Pasha Prabasakti', studentId: '15260786', role: 'leader' as const },
  { id: 'user-2', fullName: 'Budi Santoso', studentId: '2024002', role: 'member' as const },
  { id: 'user-3', fullName: 'Citra Dewi', studentId: '2024003', role: 'member' as const },
  { id: 'user-4', fullName: 'Dian Putra', studentId: '2024004', role: 'member' as const },
]

export const tasks = [
  {
    id: 'task-1',
    groupId: 'group-1',
    title: 'Desain ERD Sistem',
    description: 'Buat diagram ERD untuk sistem perpustakaan digital.',
    assigneeId: 'user-2',
    assigneeName: 'Budi Santoso',
    deadline: '2025-03-20T23:59:00Z',
    priority: 'high' as const,
    status: 'in_progress' as const,
    createdBy: 'user-1',
    createdAt: '2025-03-01T08:00:00Z',
  },
  {
    id: 'task-2',
    groupId: 'group-1',
    title: 'Implementasi API Autentikasi',
    description: 'Buat endpoint login dan register dengan JWT.',
    assigneeId: 'user-1',
    assigneeName: 'Pasha Prabasakti',
    deadline: '2025-03-18T23:59:00Z',
    priority: 'high' as const,
    status: 'in_review' as const,
    createdBy: 'user-1',
    createdAt: '2025-03-02T09:00:00Z',
  },
  {
    id: 'task-3',
    groupId: 'group-1',
    title: 'Dokumentasi SRS',
    description: 'Tulis Software Requirements Specification.',
    assigneeId: 'user-3',
    assigneeName: 'Citra Dewi',
    deadline: '2025-03-25T23:59:00Z',
    priority: 'medium' as const,
    status: 'todo' as const,
    createdBy: 'user-1',
    createdAt: '2025-03-03T10:00:00Z',
  },
  {
    id: 'task-4',
    groupId: 'group-1',
    title: 'Setup Repository GitHub',
    description: 'Inisialisasi repo, branch protection, dan CI dasar.',
    assigneeId: 'user-4',
    assigneeName: 'Dian Putra',
    deadline: '2025-03-10T23:59:00Z',
    priority: 'low' as const,
    status: 'done' as const,
    createdBy: 'user-1',
    createdAt: '2025-02-28T08:00:00Z',
  },
]

export const progressUpdates = [
  {
    id: 'update-1',
    taskId: 'task-2',
    userId: 'user-1',
    userName: 'Pasha Prabasakti',
    description: 'Endpoint register sudah selesai, tinggal login.',
    progressPercentage: 70,
    createdAt: '2025-03-10T14:30:00Z',
  },
  {
    id: 'update-2',
    taskId: 'task-2',
    userId: 'user-1',
    userName: 'Pasha Prabasakti',
    description: 'Login endpoint sudah jalan, testing dengan Postman.',
    progressPercentage: 90,
    createdAt: '2025-03-12T16:00:00Z',
  },
]

export const contributionPeriods = [
  {
    id: 'period-1',
    groupId: 'group-1',
    name: 'Evaluasi Minggu 1',
    startDate: '2025-03-10T00:00:00Z',
    endDate: '2025-03-17T23:59:59Z',
    status: 'closed' as const,
  },
  {
    id: 'period-2',
    groupId: 'group-1',
    name: 'Evaluasi Minggu 2',
    startDate: '2025-03-17T00:00:00Z',
    endDate: '2025-03-24T23:59:59Z',
    status: 'open' as const,
  },
]

export const contributionVotes = [
  // Periode 1 (sudah ditutup)
  { id: 'vote-1', periodId: 'period-1', voterId: 'user-1', targetUserId: 'user-2', score: 4, criteriaNotes: 'Aktif dan tepat waktu' },
  { id: 'vote-2', periodId: 'period-1', voterId: 'user-1', targetUserId: 'user-3', score: 5, criteriaNotes: 'Sangat membantu' },
  { id: 'vote-3', periodId: 'period-1', voterId: 'user-1', targetUserId: 'user-4', score: 3, criteriaNotes: 'Cukup berkontribusi' },
  { id: 'vote-4', periodId: 'period-1', voterId: 'user-2', targetUserId: 'user-1', score: 5, criteriaNotes: 'Ketua yang baik' },
  { id: 'vote-5', periodId: 'period-1', voterId: 'user-2', targetUserId: 'user-3', score: 4, criteriaNotes: 'Kerja bagus' },
  { id: 'vote-6', periodId: 'period-1', voterId: 'user-2', targetUserId: 'user-4', score: 3, criteriaNotes: 'Perlu lebih aktif' },
  { id: 'vote-7', periodId: 'period-1', voterId: 'user-3', targetUserId: 'user-1', score: 5, criteriaNotes: 'Sangat membantu' },
  { id: 'vote-8', periodId: 'period-1', voterId: 'user-3', targetUserId: 'user-2', score: 4, criteriaNotes: 'Tugas selesai' },
  { id: 'vote-9', periodId: 'period-1', voterId: 'user-3', targetUserId: 'user-4', score: 2, criteriaNotes: 'Kurang responsif' },
  { id: 'vote-10', periodId: 'period-1', voterId: 'user-4', targetUserId: 'user-1', score: 4, criteriaNotes: 'Baik' },
  { id: 'vote-11', periodId: 'period-1', voterId: 'user-4', targetUserId: 'user-2', score: 4, criteriaNotes: 'Bagus' },
  { id: 'vote-12', periodId: 'period-1', voterId: 'user-4', targetUserId: 'user-3', score: 5, criteriaNotes: 'Sangat aktif' },
  // Periode 2 (masih terbuka) - baru user-1 yang sudah menilai
  { id: 'vote-13', periodId: 'period-2', voterId: 'user-1', targetUserId: 'user-2', score: 4, criteriaNotes: '' },
  { id: 'vote-14', periodId: 'period-2', voterId: 'user-1', targetUserId: 'user-3', score: 5, criteriaNotes: '' },
  { id: 'vote-15', periodId: 'period-2', voterId: 'user-1', targetUserId: 'user-4', score: 3, criteriaNotes: '' },
]

export const contributionReviews = [
  {
    id: 'review-1',
    periodId: 'period-1',
    targetUserId: 'user-1',
    initialScore: 4.67,
    finalScore: 4.67,
    reviewerId: 'user-1',
    reason: 'Tidak ada perubahan, nilai rata-rata sudah adil.',
    createdAt: '2025-03-18T10:00:00Z',
  },
  {
    id: 'review-2',
    periodId: 'period-1',
    targetUserId: 'user-2',
    initialScore: 4.0,
    finalScore: 4.0,
    reviewerId: 'user-1',
    reason: 'Nilai rata-rata sudah mencerminkan kontribusi.',
    createdAt: '2025-03-18T10:05:00Z',
  },
  {
    id: 'review-3',
    periodId: 'period-1',
    targetUserId: 'user-3',
    initialScore: 4.67,
    finalScore: 4.5,
    reviewerId: 'user-1',
    reason: 'Sedikit menurunkan karena keterlambatan pada tugas dokumentasi.',
    createdAt: '2025-03-18T10:10:00Z',
  },
  {
    id: 'review-4',
    periodId: 'period-1',
    targetUserId: 'user-4',
    initialScore: 2.67,
    finalScore: 3.0,
    reviewerId: 'user-1',
    reason: 'Menaikkan sedikit karena mulai lebih aktif di minggu terakhir.',
    createdAt: '2025-03-18T10:15:00Z',
  },
]