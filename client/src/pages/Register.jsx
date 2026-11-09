import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'

function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <Card className="mx-auto w-full max-w-2xl p-6 sm:p-9">
        <header className="mb-8 max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">Join the community</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink">Create your Nagara account</h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            This registration screen is a visual prototype. It does not create an account or send your information.
          </p>
        </header>
        <form className="grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit}>
          <Input autoComplete="name" label="Full name" placeholder="Your full name" required />
          <Input autoComplete="email" label="Email address" placeholder="you@example.com" required type="email" />
          <Input autoComplete="tel" label="Phone number" placeholder="Your phone number" required type="tel" />
          <div className="grid gap-1.5">
            <label className="text-sm font-medium text-ink" htmlFor="register-municipality">
              Municipality
            </label>
            <select
              className="min-h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-ink focus-visible:border-focus focus-visible:outline-focus"
              defaultValue=""
              id="register-municipality"
              required
            >
              <option disabled value="">Choose your municipality</option>
              <option value="ghmc">GHMC</option>
              <option value="warangal">Warangal</option>
            </select>
          </div>
          <div className="grid gap-1.5">
            <label className="text-sm font-medium text-ink" htmlFor="register-password">
              Password
            </label>
            <div className="relative">
              <Input
                autoComplete="new-password"
                className="pr-12"
                id="register-password"
                placeholder="Create a password"
                required
                type={showPassword ? 'text' : 'password'}
              />
              <button
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-2 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-muted hover:bg-surface-muted hover:text-ink focus-visible:outline-focus"
                onClick={() => setShowPassword((visible) => !visible)}
                type="button"
              >
                {showPassword ? <EyeOff aria-hidden="true" size={18} /> : <Eye aria-hidden="true" size={18} />}
              </button>
            </div>
          </div>
          <div className="grid gap-1.5">
            <label className="text-sm font-medium text-ink" htmlFor="register-confirm-password">
              Confirm password
            </label>
            <div className="relative">
              <Input
                autoComplete="new-password"
                className="pr-12"
                id="register-confirm-password"
                placeholder="Enter your password again"
                required
                type={showConfirmPassword ? 'text' : 'password'}
              />
              <button
                aria-label={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'}
                className="absolute right-2 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-muted hover:bg-surface-muted hover:text-ink focus-visible:outline-focus"
                onClick={() => setShowConfirmPassword((visible) => !visible)}
                type="button"
              >
                {showConfirmPassword ? <EyeOff aria-hidden="true" size={18} /> : <Eye aria-hidden="true" size={18} />}
              </button>
            </div>
          </div>
          <div className="mt-2 sm:col-span-2">
            <Button className="w-full" size="lg" type="submit">
              Create account
              <ArrowRight aria-hidden="true" size={18} />
            </Button>
          </div>
        </form>
        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{' '}
          <Link className="font-semibold text-primary hover:underline" to="/login">
            Log in
          </Link>
        </p>
      </Card>
    </section>
  )
}

export default Register
