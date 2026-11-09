import { ArrowRight, Building2, HeartHandshake, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from '../components/ui/Card.jsx'

const roles = [
  {
    icon: UsersRound,
    title: 'Citizens',
    description: 'Bring neighborhood concerns forward and follow the progress of their reports.',
  },
  {
    icon: Building2,
    title: 'Municipal officers',
    description: 'Review reports within their municipality and coordinate the right response.',
  },
  {
    icon: HeartHandshake,
    title: 'Field workers',
    description: 'Carry out assigned work and submit evidence for an officer to review.',
  },
]

function About() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <section className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">About Nagara</p>
        <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
          Civic technology should make local action easier to see.
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted">
          Nagara is an academic civic-tech prototype designed to connect people
          who notice infrastructure issues with the municipal teams who can
          respond to them.
        </p>
      </section>

      <section className="mt-14 grid gap-10 lg:grid-cols-[1fr_.9fr] lg:items-center">
        <Card className="p-7 sm:p-9">
          <h2 className="text-2xl font-bold text-ink">Why reporting matters</h2>
          <p className="mt-4 leading-7 text-muted">
            A damaged road, a water leak or a broken streetlight can affect
            daily life and community safety. A useful reporting process needs
            more than a place to submit a concern: people need to understand
            where it goes, who is responsible for the next step, and whether
            the proposed fix was reviewed.
          </p>
          <p className="mt-4 leading-7 text-muted">
            Nagara explores how clear status updates, scoped municipal work
            queues and completion evidence can make that journey easier to
            follow.
          </p>
        </Card>
        <div className="rounded-2xl bg-surface-muted p-7 sm:p-9">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">The intended impact</p>
          <h2 className="mt-3 text-2xl font-bold text-ink">Less uncertainty. Better coordination.</h2>
          <ul className="mt-6 space-y-4">
            {[
              'Make it easier for residents to raise local concerns.',
              'Help municipal teams organize reports within their jurisdiction.',
              'Make progress and resolution review visible to participants.',
            ].map((item) => (
              <li className="flex gap-3 text-sm leading-6 text-muted" key={item}>
                <span aria-hidden="true" className="mt-2 size-2 shrink-0 rounded-full bg-secondary" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">A shared workflow</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink">Three roles, one visible journey.</h2>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {roles.map(({ icon: Icon, title, description }) => (
            <Card className="p-6" key={title}>
              <Icon aria-hidden="true" className="text-primary" size={25} />
              <h3 className="mt-5 text-lg font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
            </Card>
          ))}
        </div>
      </section>

      <div className="mt-14">
        <Link
          className="inline-flex min-h-10 items-center gap-2 rounded-md border border-primary bg-surface px-4 py-2 font-medium text-ink hover:bg-surface-muted focus-visible:outline-focus"
          to="/how-it-works"
        >
          See how the workflow fits together
          <ArrowRight aria-hidden="true" size={17} />
        </Link>
      </div>
      <p className="mt-16 border-t border-border pt-6 text-xs leading-5 text-muted">
        Nagara is an independent academic prototype. It is not affiliated with
        the Government of Telangana or any municipal corporation and does not
        connect to government systems.
      </p>
    </div>
  )
}

export default About
