import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './components/auth/LoginPage'
import RegisterPage from './components/auth/RegisterPage'
import PreguntaMultiple from './pages/PreguntaMultiple'
import PreguntaUnica from './pages/PreguntaUnica'
import PreguntaVF from './pages/PreguntaVF'
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
              <>
                <h1>Inicio (componentes de prueba)</h1>
                <PreguntaVF />
                <PreguntaUnica />
                <PreguntaMultiple />
              </>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rutas de ejemplo para enlaces condicionales */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <h2>Panel Admin (acceso restringido)</h2>
            </ProtectedRoute>
          }
        />
        <Route
          path="/mis-preguntas"
          element={
            <ProtectedRoute>
              <h2>Mis Preguntas (usuario)</h2>
            </ProtectedRoute>
          }
        />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App