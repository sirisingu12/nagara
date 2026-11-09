import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'

function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address.')
      return
    }
    if (!password) {
      setError('Enter your password.')
      return
    }
    setIsSubmitting(true)
    try {
      await login({ email, password })
      const returnTo = location.state?.from
      navigate(
        typeof returnTo === 'string' && returnTo.startsWith('/')
          ? returnTo
          : '/',
        { replace: true },
      )
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto grid min-h-[70vh] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
      <div className="hidden max-w-xl lg:block">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">Welcome back</p>
        <h1 className="mt-4 text-5xl font-bold leading-tight tracking-tight text-ink">
          Keep your community moving forward.
        </h1>
        <p className="mt-5 text-lg leading-8 text-muted">
          Sign in to follow reports and updates in the Nagara prototype.
        </p>
        <div className="mt-8 flex items-center gap-3 text-sm text-muted">
          <LockKeyhole aria-hidden="true" className="text-primary" size={19} />
          Your short-lived access token stays in memory; your refresh session uses an HttpOnly cookie.
        </div>
      </div>
      <Card className="mx-auto w-full max-w-md p-6 sm:p-8">
        <div className="mb-7">
          <p className="text-sm font-semibold text-primary">Nagara account</p>
          <h2 className="mt-2 text-2xl font-bold text-ink">Log in</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Use your Nagara account to continue.
          </p>
        </div>
        <form className="grid gap-5" noValidate onSubmit={handleSubmit}>
          <Input
            autoComplete="email"
            error={email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? 'Enter a valid email address.' : undefined}
            label="Email address"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            type="email"
            value={email}
          />
          <div className="grid gap-2">
            <label className="text-sm font-medium text-ink" htmlFor="login-password">
              Password
            </label>
            <div className="relative">
              <Input
                autoComplete="current-password"
                className="pr-12"
                id="login-password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
              />
              <button
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-2 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-muted hover:bg-surface-muted hover:text-ink focus-visible:outline-focus"
                onClick={() => setShowPassword((visible) => !visible)}
                type="button"
              >
                {showPassword ? (
                  <EyeOff aria-hidden="true" size={18} />
                ) : (
                  <Eye aria-hidden="true" size={18} />
                )}
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-primary" role="alert">{error}</p>}
          <Button className="w-full" loading={isSubmitting} type="submit">
            Log in
            <Mail aria-hidden="true" size={17} />
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted">
          New to Nagara?{' '}
          <Link className="font-semibold text-primary hover:underline" to="/register">
            Create an account
          </Link>
        </p>
      </Card>
    </section>
  )
}

export default Login
