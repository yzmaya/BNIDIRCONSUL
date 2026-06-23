import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import PendingPage from './pages/auth/PendingPage'
import AdminPanel from './pages/admin/AdminPanel'
import FileUpload from './components/FileUpload'
import Dashboard from './components/Dashboard'

function AppRouter() {
  const { session, profile } = useAuth()
  const [view, setView] = useState('login')   // 'login' | 'register'
  const [palmsData, setPalmsData] = useState(null)
  const [showAdmin, setShowAdmin] = useState(false)

  // Still loading session
  if (session === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Not logged in
  if (!session) {
    if (view === 'register') return <RegisterPage onGoLogin={() => setView('login')} />
    return <LoginPage onGoRegister={() => setView('register')} />
  }

  // Logged in but profile still loading
  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Pending approval
  if (!profile.aprobado) return <PendingPage />

  // Admin panel
  if (showAdmin && profile.role === 'admin') {
    return <AdminPanel onGoToDashboard={() => setShowAdmin(false)} />
  }

  // Main dashboard flow
  if (!palmsData) {
    return (
      <FileUpload
        onParsed={setPalmsData}
        profile={profile}
        onGoAdmin={profile.role === 'admin' ? () => setShowAdmin(true) : null}
      />
    )
  }

  return (
    <Dashboard
      data={palmsData}
      profile={profile}
      onReset={() => setPalmsData(null)}
      onGoAdmin={profile.role === 'admin' ? () => setShowAdmin(true) : null}
    />
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}
