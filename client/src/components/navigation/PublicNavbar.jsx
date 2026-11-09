import { ArrowRight, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import ThemeToggle from './ThemeToggle.jsx'

const navigationLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'How it works', to: '/how-it-works' },
]

function PublicNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const location = useLocation()
  const { user, logout, sessionError } = useAuth()

  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!isMenuOpen) {
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isMenuOpen])

  const linkClassName = ({ isActive }) =>
    `rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-focus ${
      isActive
        ? 'bg-surface-muted text-primary'
        : 'text-muted hover:bg-surface-muted hover:text-ink'
    }`

  const handleLogout = async () => {
    setLogoutError('')
    setIsMenuOpen(false)
    try {
      await logout()
    } catch (error) {
      setLogoutError(error.message)
    }
  }

  const accountActions = (
    <>
      {user ? (
        <>
          <span className="px-2 text-sm text-muted">
            {user.fullName} <span className="capitalize">({user.role})</span>
          </span>
          <button
            className="rounded-md px-3 py-2 text-sm font-semibold text-primary hover:bg-surface-muted focus-visible:outline-focus"
            onClick={handleLogout}
            type="button"
          >
            Log out
          </button>
        </>
      ) : (
        <>
          <Link
            className="rounded-md px-3 py-2 text-sm font-semibold text-primary hover:bg-surface-muted focus-visible:outline-focus"
            to="/login"
          >
            Log in
          </Link>
          <Link
            className="inline-flex min-h-10 items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-page transition-[filter] hover:brightness-95 focus-visible:outline-focus"
            to="/register"
          >
            Get started
            <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </>
      )}
    </>
  )

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-page/95 backdrop-blur">
      <div className="mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          aria-label="Nagara home"
          className="inline-flex shrink-0 items-center gap-2 rounded-md focus-visible:outline-focus"
          to="/"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-page">
            <span aria-hidden="true" className="text-xl font-bold">
              N
            </span>
          </span>
          <span className="text-xl font-bold tracking-tight text-ink">Nagara</span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
          {navigationLinks.map((link) => (
            <NavLink className={linkClassName} key={link.to} to={link.to}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />
          {accountActions}
        </div>

        <button
          aria-controls="mobile-navigation"
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="inline-flex size-10 items-center justify-center rounded-md border border-border text-ink hover:bg-surface-muted focus-visible:outline-focus lg:hidden"
          onClick={() => setIsMenuOpen((open) => !open)}
          type="button"
        >
          {isMenuOpen ? (
            <X aria-hidden="true" size={21} />
          ) : (
            <Menu aria-hidden="true" size={21} />
          )}
        </button>
      </div>

      {isMenuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="border-t border-border bg-page px-4 py-4 lg:hidden sm:px-6"
          id="mobile-navigation"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            {navigationLinks.map((link) => (
              <NavLink className={linkClassName} key={link.to} to={link.to}>
                {link.label}
              </NavLink>
            ))}
            <div className="flex flex-wrap items-center gap-3 border-t border-border pt-3">
              <ThemeToggle />
              {accountActions}
            </div>
          </div>
        </nav>
      )}
      {(logoutError || (!user && sessionError)) && (
        <p className="mx-auto max-w-7xl px-4 pb-3 text-sm text-primary sm:px-6 lg:px-8" role="alert">
          {logoutError || sessionError}
        </p>
      )}
    </header>
  )
}

export default PublicNavbar
