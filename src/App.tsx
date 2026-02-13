import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './components/auth/RegisterPage'
import PreguntaMultiple from './components/PreguntaMultiple'
import PreguntaUnica from './components/PreguntaUnica'
import PreguntaVF from './components/PreguntaVF'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Navbar from './components/Navbar'

function App() {
  return (
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
  )
}

export default App