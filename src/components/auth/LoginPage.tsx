import React, { useState } from 'react'

import { useAuth } from '../../context/AuthContext.tsx'

interface LoginPageProps {
	redirectTo?: string
	registerPath?: string
	onLoginSuccess?: () => void
}

function LoginPage({ redirectTo = '/dashboard', registerPath = '/register', onLoginSuccess }: LoginPageProps): React.ReactElement {
	const { login } = useAuth()

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
			await login(normalizedUsername, normalizedPassword)

			if (typeof onLoginSuccess === 'function') {
				onLoginSuccess()
			} else {
				window.location.assign(redirectTo)
			}
		} catch (submitError: unknown) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const anyErr = submitError as any
			setError(anyErr?.message || 'Usuario o contraseña incorrectos.')
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<section>
			<h1>Iniciar Sesión</h1>

			<form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} noValidate>
				<div>
					<label htmlFor="username">Username</label>
					<input
						id="username"
						name="username"
						type="text"
						autoComplete="username"
										value={username}
										onChange={(event: React.ChangeEvent<HTMLInputElement>) => setUsername(event.target.value)}
						required
					/>
				</div>

				<div>
					<label htmlFor="password">Password</label>
					<input
						id="password"
						name="password"
						type="password"
						autoComplete="current-password"
										value={password}
										onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
						required
					/>
				</div>

				{error && (
					<div role="alert" aria-live="polite">
						{error}
					</div>
				)}

				<button type="submit" disabled={isSubmitting}>
					{isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
				</button>
			</form>

			<p>
				¿No tienes cuenta? <a href={registerPath}>Regístrate</a>
			</p>
		</section>
	)
}

export default LoginPage
