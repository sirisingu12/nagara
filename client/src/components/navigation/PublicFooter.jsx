import { ArrowUpRight, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

function PublicFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <Link
            aria-label="Nagara home"
            className="inline-flex items-center gap-2 rounded-md focus-visible:outline-focus"
            to="/"
          >
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-lg font-bold text-page">
              N
            </span>
            <span className="text-lg font-bold text-ink">Nagara</span>
          </Link>
          <p className="mt-4 max-w-md text-sm leading-6 text-muted">
            A civic-tech prototype helping communities report local
            infrastructure issues and follow their journey toward resolution.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-ink">Explore</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            <li><Link className="hover:text-primary" to="/">Home</Link></li>
            <li><Link className="hover:text-primary" to="/about">About Nagara</Link></li>
            <li><Link className="hover:text-primary" to="/how-it-works">How it works</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-ink">A local idea</h2>
          <p className="mt-4 flex items-start gap-2 text-sm leading-6 text-muted">
            <MapPin aria-hidden="true" className="mt-1 shrink-0 text-primary" size={17} />
            <span>Designed as an academic prototype for communities in Telangana.</span>
          </p>
          <a
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            href="https://www.openstreetmap.org/"
            rel="noreferrer"
            target="_blank"
          >
            OpenStreetMap
            <ArrowUpRight aria-hidden="true" size={15} />
          </a>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-7xl px-4 py-4 text-xs leading-5 text-muted sm:px-6 lg:px-8">
          Nagara is an independent academic prototype, not an official government
          service. Demo locations and information are illustrative.
        </p>
      </div>
    </footer>
  )
}

export default PublicFooter
