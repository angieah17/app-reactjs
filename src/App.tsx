import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './components/auth/RegisterPage'
import PreguntaMultiple from './components/PreguntaMultiple'
import PreguntaUnica from './components/PreguntaUnica'
import PreguntaVF from './components/PreguntaVF'

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Inicio</Link> | <Link to="/login">Login</Link> | <Link to="/register">Register</Link>
      </nav>

      <Routes>
        <Route path="/" element={
          <>
            <h1>Inicio (componentes de prueba)</h1>
            <PreguntaVF />
            <PreguntaUnica />
            <PreguntaMultiple />
          </>
        } />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App