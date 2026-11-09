import { ArrowLeft, MapPinOff } from 'lucide-react'
import { Link } from 'react-router-dom'
function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-surface-muted text-primary">
        <MapPinOff aria-hidden="true" size={30} />
      </span>
      <p className="mt-6 text-sm font-semibold uppercase tracking-[0.14em] text-primary">404 · Not found</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink">This page isn’t on the map.</h1>
      <p className="mt-3 max-w-lg leading-7 text-muted">
        The address may have changed, or the page may not be part of this prototype.
      </p>
      <Link
        className="mt-7 inline-flex min-h-10 items-center gap-2 rounded-md border border-primary bg-surface px-4 py-2 font-medium text-ink hover:bg-surface-muted focus-visible:outline-focus"
        to="/"
      >
        <ArrowLeft aria-hidden="true" size={17} />
        Back to home
      </Link>
    </section>
  )
}

export default NotFound
