import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './components/auth/LoginPage'
import RegisterPage from './components/auth/RegisterPage'
import AdminQuestionsPage from './pages/AdminQuestionsPage'
import AdminQuestionDetailPage from './pages/AdminQuestionDetailPage'
import TestGeneratePage from './pages/TestGeneratePage'
import TestHistoryPage from './pages/TestHistoryPage'
import TestPlayPage from './pages/TestPlayPage'
import TestResultsPage from './pages/TestResultsPage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Navbar from './components/layout/Navbar'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/AuthContext'

function getRoles(user: any): string[] {
  if (!user) return []
  if (Array.isArray(user.roles)) {
    return user.roles.map((role: any) => role?.authority || role?.name || String(role))
  }
  if (Array.isArray(user.authorities)) {
    return user.authorities.map((role: any) => role?.authority || role?.name || String(role))
  }
  if (user.roles) return [String(user.roles)]
  if (user.role) return [String(user.role)]
  if (user.authority) return [String(user.authority)]
  return []
}

function HomeRoute() {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />

  const roles = getRoles(user)
  const isAdmin = roles.some((role) => String(role).toUpperCase().includes('ADMIN'))
  return <Navigate to={isAdmin ? '/admin' : '/mis-preguntas'} replace />
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />

        <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route
          path="/tests/generar"
          element={
            <ProtectedRoute>
              <TestGeneratePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tests/play"
          element={
            <ProtectedRoute>
              <TestPlayPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tests/resultados"
          element={
            <ProtectedRoute>
              <TestResultsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tests/historial"
          element={
            <ProtectedRoute>
              <TestHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRoles={['ADMIN']} unauthorizedRedirectTo="/mis-preguntas">
              <AdminQuestionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/preguntas/:id"
          element={
            <ProtectedRoute requiredRoles={['ADMIN']} unauthorizedRedirectTo="/mis-preguntas">
              <AdminQuestionDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mis-preguntas"
          element={
            <ProtectedRoute>
              <TestGeneratePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App