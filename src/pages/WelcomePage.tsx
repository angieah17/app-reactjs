function WelcomePage() {
  const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:8080'

  const handleStart = () => {
    const normalizedApiBase = apiBase.trim().replace(/\/+$/, '')
    window.location.href = `${normalizedApiBase}/`
  }

  return (
    <section>
      <h1>Bienvenido</h1>
      <p>Accede a la plataforma y comienza tu experiencia.</p>

      <button type="button" onClick={handleStart}>
        Empezar
      </button>
    </section>
  )
}

export default WelcomePage