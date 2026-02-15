import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './components/auth/LoginPage'
import RegisterPage from './components/auth/RegisterPage'
import PreguntaMultiple from './pages/PreguntaMultiple'
import PreguntaUnica from './pages/PreguntaUnica'
import PreguntaVF from './pages/PreguntaVF'
import TestGeneratePage from './pages/TestGeneratePage'
import TestHistoryPage from './pages/TestHistoryPage'
import TestPlayPage from './pages/TestPlayPage'
import TestResultsPage from './pages/TestResultsPage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Navbar from './components/layout/Navbar'
import { AuthProvider } from './context/AuthContext'


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />

        <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <TestGeneratePage />
            </ProtectedRoute>
          }
        />
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

        {/* Rutas de ejemplo para enlaces condicionales */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRoles={['ADMIN']} unauthorizedRedirectTo="/mis-preguntas">
              <h2>Panel Admin (acceso restringido)</h2>
            </ProtectedRoute>
          }
        />
        <Route
          path="/mis-preguntas"
          element={
            <ProtectedRoute>
              <>
                <h2>Mis Preguntas (usuario)</h2>
                <PreguntaVF />
                <PreguntaUnica />
                <PreguntaMultiple />
              </>
            </ProtectedRoute>
          }
        />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App