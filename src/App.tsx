import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { HomePage } from './pages/HomePage'
import { GroupsPage } from './pages/GroupsPage'
import { GroupDetailPage } from './pages/GroupDetailPage'
import { TasksPage } from './pages/TasksPage'
import { TaskDetailPage } from './pages/TaskDetailPage'
import { EvaluationPage } from './pages/EvaluationPage'
import { ReportPage } from './pages/ReportPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Halaman Publik */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Halaman Terproteksi */}
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/groups" element={<ProtectedRoute><GroupsPage /></ProtectedRoute>} />
          <Route path="/groups/:groupId" element={<ProtectedRoute><GroupDetailPage /></ProtectedRoute>} />
          <Route path="/groups/:groupId/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
          <Route path="/groups/:groupId/tasks/:taskId" element={<ProtectedRoute><TaskDetailPage /></ProtectedRoute>} />
          <Route path="/groups/:groupId/evaluation" element={<ProtectedRoute><EvaluationPage /></ProtectedRoute>} />
          <Route path="/groups/:groupId/report" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
          
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl font-bold text-primary-600 mb-2">404</p>
        <h1 className="text-xl font-semibold text-slate-900 mb-2">Halaman tidak ditemukan</h1>
        <p className="text-slate-500 mb-6">Halaman yang Anda cari tidak ada atau telah dipindahkan.</p>
        <a
          href="/"
          className="inline-flex px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Kembali ke Beranda
        </a>
      </div>
    </div>
  )
}

export default App