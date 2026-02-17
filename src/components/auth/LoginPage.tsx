import React, { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext.tsx'

interface LoginPageProps {
	redirectTo?: string
	registerPath?: string
	onLoginSuccess?: () => void
}

/* Regla implementada: si rol contiene ADMIN, redirige a /admin.
Regla implementada: autenticado no admin, redirige a /mis-preguntas.
Regla implementada: si entra a /login ya autenticado, se redirige automáticamente según rol.
  */

function getRoles(user: any): string[] {
	if (!user) return []
	if (Array.isArray(user.roles)) return user.roles.map((r: any) => r?.authority || r?.name || String(r))
	if (user.roles) return [String(user.roles)]
	if (user.role) return [String(user.role)]
	return []
}

function getPostLoginPath(user: any): string {
	const roles = getRoles(user)
	const isAdmin = roles.some((r) => String(r).toUpperCase().includes('ADMIN'))
	return isAdmin ? '/admin' : '/mis-preguntas'
}

function LoginPage({ redirectTo, registerPath = '/register', onLoginSuccess }: LoginPageProps): React.ReactElement {
	const { login, user, isAuthenticated, isLoading } = useAuth()
	const navigate = useNavigate()

	const [username, setUsername] = useState<string>('')
	const [password, setPassword] = useState<string>('')
	const [error, setError] = useState<string>('')
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

	const handleSubmit = async (): Promise<void> => {
		setError('')

		const normalizedUsername = username.trim()
		const normalizedPassword = password.trim()

		if (!normalizedUsername || !normalizedPassword) {
			setError('Username y password son obligatorios.')
			return
		}

		setIsSubmitting(true)

		try {
			const currentUser = await login(normalizedUsername, normalizedPassword)

			if (typeof onLoginSuccess === 'function') {
				onLoginSuccess()
			} else {
				navigate(redirectTo ?? getPostLoginPath(currentUser), { replace: true })
			}
		} catch (submitError: unknown) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const anyErr = submitError as any
			setError(anyErr?.message || 'Usuario o contraseña incorrectos.')
		} finally {
			setIsSubmitting(false)
		}
	}

	if (!isLoading && isAuthenticated) {
		return <Navigate to={getPostLoginPath(user)} replace />
	}

	return (
		<section className="mx-auto" style={{ maxWidth: 480 }}>
			<h1>Iniciar Sesión</h1>

			<form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} noValidate>
				<div className="mb-3">
					<label htmlFor="username" className="form-label">Username</label>
					<input
						id="username"
						name="username"
						type="text"
						autoComplete="username"
										value={username}
										onChange={(event: React.ChangeEvent<HTMLInputElement>) => setUsername(event.target.value)}
						className="form-control"
						required
					/>
				</div>

				<div className="mb-3">
					<label htmlFor="password" className="form-label">Password</label>
					<input
						id="password"
						name="password"
						type="password"
						autoComplete="current-password"
										value={password}
										onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
						className="form-control"
						required
					/>
				</div>

				{error && (
					<div className="alert alert-danger" role="alert" aria-live="polite">
						{error}
					</div>
				)}

				<button type="submit" className="btn btn-primary" disabled={isSubmitting}>
					{isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
				</button>
			</form>

			<p className="mt-3 mb-0">
				¿No tienes cuenta? <a href={registerPath}>Regístrate</a>
			</p>
		</section>
	)
}

export default LoginPage
