import { Outlet } from 'react-router-dom'
import PublicFooter from '../components/navigation/PublicFooter.jsx'
import PublicNavbar from '../components/navigation/PublicNavbar.jsx'

function PublicLayout() {
  return (
    <>
      <a
        className="sr-only z-50 rounded-md bg-primary px-4 py-2 font-medium text-page focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus-visible:outline-focus"
        href="#main-content"
      >
        Skip to content
      </a>
      <PublicNavbar />
      <main id="main-content" className="min-h-[60vh]">
        <Outlet />
      </main>
      <PublicFooter />
    </>
  )
}

export default PublicLayout
