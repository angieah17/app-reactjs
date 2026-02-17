import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './components/auth/LoginPage'
import RegisterPage from './components/auth/RegisterPage'
import AdminQuestionsPage from './pages/AdminQuestionsPage'
import AdminQuestionDetailPage from './pages/AdminQuestionDetailPage'
import AdminUsuariosPage from './pages/AdminUsuariosPage'
import AdminUploadCsvPage from './pages/AdminUploadCsvPage'
import TestGeneratePage from './pages/TestGeneratePage'
import TestHistoryPage from './pages/TestHistoryPage'
import TestPlayPage from './pages/TestPlayPage'
import TestResultsPage from './pages/TestResultsPage'
import WelcomePage from './pages/WelcomePage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Navbar from './components/layout/Navbar'
import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />

        <div className="container py-4">
          <Routes>
          <Route path="/" element={<WelcomePage />} />
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
            path="/admin/usuarios"
            element={
              <ProtectedRoute requiredRoles={['ADMIN']} unauthorizedRedirectTo="/mis-preguntas">
                <AdminUsuariosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/preguntas/upload"
            element={
              <ProtectedRoute requiredRoles={['ADMIN']} unauthorizedRedirectTo="/mis-preguntas">
                <AdminUploadCsvPage />
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
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App