import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'

function Login() {
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
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
          A visual demonstration only. Sign-in is not connected yet.
        </div>
      </div>
      <Card className="mx-auto w-full max-w-md p-6 sm:p-8">
        <div className="mb-7">
          <p className="text-sm font-semibold text-primary">Nagara account</p>
          <h2 className="mt-2 text-2xl font-bold text-ink">Log in</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            This form is a visual prototype and does not authenticate.
          </p>
        </div>
        <form className="grid gap-5" onSubmit={handleSubmit}>
          <Input
            autoComplete="email"
            label="Email address"
            placeholder="you@example.com"
            required
            type="email"
          />
          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-medium text-ink" htmlFor="login-password">
                Password
              </label>
            </div>
            <div className="relative">
              <Input
                autoComplete="current-password"
                className="pr-12"
                id="login-password"
                placeholder="Enter your password"
                required
                type={showPassword ? 'text' : 'password'}
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
          <Button className="w-full" type="submit">
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
