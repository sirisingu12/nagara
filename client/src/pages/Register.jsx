import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { apiClient } from '../services/api.js'

function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [municipalities, setMunicipalities] = useState([])
  const [municipalityError, setMunicipalityError] = useState('')
  const [districtId, setDistrictId] = useState('')
  const [municipalityId, setMunicipalityId] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const districts = useMemo(() => {
    const unique = new Map()
    municipalities.forEach((municipality) => {
      unique.set(municipality.district.id, municipality.district)
    })
    return [...unique.values()]
  }, [municipalities])

  const availableMunicipalities = municipalities.filter(
    (municipality) => municipality.district.id === districtId,
  )

  useEffect(() => {
    let active = true
    apiClient.get('/municipalities', { auth: false })
      .then((items) => {
        if (active) {
          setMunicipalities(items)
        }
      })
      .catch((requestError) => {
        if (active) {
          setMunicipalityError(requestError.message)
        }
      })
    return () => {
      active = false
    }
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setFieldErrors({})
    const formData = new FormData(event.currentTarget)
    const password = formData.get('password')
    const confirmPassword = formData.get('confirmPassword')
    const errors = {}
    const fullName = formData.get('fullName')?.trim() || ''
    const email = formData.get('email')?.trim() || ''
    const phone = formData.get('phone')?.trim() || ''
    if (fullName.length < 2 || fullName.length > 160) {
      errors.fullName = 'Enter a name between 2 and 160 characters.'
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Enter a valid email address.'
    }
    if (!/^[+()\d .-]{7,32}$/.test(phone)) {
      errors.phone = 'Enter a valid phone number.'
    }
    if (!districtId) {
      errors.districtId = 'Select a district.'
    }
    if (!municipalityId) {
      errors.municipalityId = 'Select a municipality.'
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.'
    }
    if (
      typeof password !== 'string' ||
      password.length < 8 ||
      new TextEncoder().encode(password).length > 72 ||
      !/[A-Za-z]/.test(password) ||
      !/\d/.test(password)
    ) {
      errors.password = 'Use at least 8 characters, including a letter and a number.'
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setIsSubmitting(true)
    try {
      await register({
        fullName,
        email,
        phone,
        password,
        districtId,
        municipalityId,
      })
      navigate('/', { replace: true })
    } catch (requestError) {
      const details = requestError.details || []
      setFieldErrors(Object.fromEntries(details.map(({ field, message }) => [field, message])))
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <Card className="mx-auto w-full max-w-2xl p-6 sm:p-9">
        <header className="mb-8 max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">Join the community</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink">Create your Nagara account</h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            Public registration creates a citizen account. Officer and field-worker accounts are managed separately.
          </p>
        </header>
        <form className="grid gap-5 sm:grid-cols-2" noValidate onSubmit={handleSubmit}>
          <Input
            autoComplete="name"
            error={fieldErrors.fullName}
            label="Full name"
            name="fullName"
            placeholder="Your full name"
            required
          />
          <Input
            autoComplete="email"
            error={fieldErrors.email}
            label="Email address"
            name="email"
            placeholder="you@example.com"
            required
            type="email"
          />
          <Input
            autoComplete="tel"
            error={fieldErrors.phone}
            label="Phone number"
            name="phone"
            placeholder="Your phone number"
            required
            type="tel"
          />
          <div className="grid gap-1.5">
            <label className="text-sm font-medium text-ink" htmlFor="register-district">
              District
            </label>
            <select
              aria-invalid={fieldErrors.districtId ? true : undefined}
              className="min-h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-ink focus-visible:border-focus focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60"
              disabled={districts.length === 0}
              id="register-district"
              onChange={(event) => {
                setDistrictId(event.target.value)
                setMunicipalityId('')
              }}
              required
              value={districtId}
            >
              <option value="">Choose your district</option>
              {districts.map((district) => (
                <option key={district.id} value={district.id}>{district.name}</option>
              ))}
            </select>
            {fieldErrors.districtId && (
              <p className="text-sm font-medium text-primary" role="alert">{fieldErrors.districtId}</p>
            )}
          </div>
          <div className="grid gap-1.5">
            <label className="text-sm font-medium text-ink" htmlFor="register-municipality">
              Municipality
            </label>
            <select
              aria-invalid={fieldErrors.municipalityId ? true : undefined}
              className="min-h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-ink focus-visible:border-focus focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!districtId || availableMunicipalities.length === 0}
              id="register-municipality"
              onChange={(event) => setMunicipalityId(event.target.value)}
              required
              value={municipalityId}
            >
              <option value="">Choose your municipality</option>
              {availableMunicipalities.map((municipality) => (
                <option key={municipality.id} value={municipality.id}>{municipality.name}</option>
              ))}
            </select>
            {fieldErrors.municipalityId && (
              <p className="text-sm font-medium text-primary" role="alert">{fieldErrors.municipalityId}</p>
            )}
          </div>
          <div className="grid gap-1.5">
            <label className="text-sm font-medium text-ink" htmlFor="register-password">
              Password
            </label>
            <div className="relative">
              <Input
                autoComplete="new-password"
                className="pr-12"
                error={fieldErrors.password}
                id="register-password"
                name="password"
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
                error={fieldErrors.confirmPassword}
                id="register-confirm-password"
                name="confirmPassword"
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
          {municipalityError && (
            <p className="text-sm text-primary sm:col-span-2" role="alert">{municipalityError}</p>
          )}
          {error && <p className="text-sm text-primary sm:col-span-2" role="alert">{error}</p>}
          <div className="mt-2 sm:col-span-2">
            <Button
              className="w-full"
              disabled={!municipalityId || Boolean(municipalityError)}
              loading={isSubmitting}
              size="lg"
              type="submit"
            >
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
