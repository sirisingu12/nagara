import {
  ArrowDown,
  CheckCircle2,
  ClipboardCheck,
  FileImage,
  MapPin,
  UserRoundCheck,
  Wrench,
} from 'lucide-react'
import Card from '../components/ui/Card.jsx'

const steps = [
  {
    icon: MapPin,
    label: '01',
    title: 'A citizen reports an issue',
    description: 'The resident describes the concern and identifies the place that needs attention.',
  },
  {
    icon: ClipboardCheck,
    label: '02',
    title: 'An officer verifies and assigns it',
    description: 'A municipal officer reviews the report and routes it to the appropriate team.',
  },
  {
    icon: Wrench,
    label: '03',
    title: 'A field worker handles the issue',
    description: 'The assigned worker accepts the task and records progress as the work moves forward.',
  },
  {
    icon: FileImage,
    label: '04',
    title: 'The worker submits evidence',
    description: 'Completion notes and photos give the reviewing officer a record of the work.',
  },
  {
    icon: UserRoundCheck,
    label: '05',
    title: 'An officer reviews the resolution',
    description: 'The officer reviews the submitted evidence and approves the resolution or requests rework.',
  },
  {
    icon: CheckCircle2,
    label: '06',
    title: 'The citizen tracks progress',
    description: 'Status history keeps the reporting resident informed throughout the process.',
  },
]

function HowItWorks() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">How it works</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          From a local concern to a reviewed outcome.
        </h1>
        <p className="mt-5 text-lg leading-8 text-muted">
          Every step has a clear role, so reports can move forward with context and accountability.
        </p>
      </header>

      <ol className="mx-auto mt-14 max-w-3xl">
        {steps.map(({ icon: Icon, label, title, description }, index) => (
          <li className="relative pb-8 last:pb-0" key={label}>
            {index < steps.length - 1 && (
              <span aria-hidden="true" className="absolute left-6 top-14 h-[calc(100%-2.5rem)] w-px bg-border" />
            )}
            <Card className="relative flex gap-4 p-5 sm:gap-6 sm:p-6">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-primary">
                <Icon aria-hidden="true" size={23} />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold tracking-wider text-primary">STEP {label}</p>
                <h2 className="mt-1 text-lg font-semibold text-ink">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
              </div>
            </Card>
            {index < steps.length - 1 && (
              <ArrowDown aria-hidden="true" className="absolute -bottom-1 left-[1.15rem] z-10 bg-page text-muted" size={20} />
            )}
          </li>
        ))}
      </ol>
      <p className="mx-auto mt-12 max-w-3xl rounded-xl border border-border bg-surface-muted p-5 text-sm leading-6 text-muted">
        This describes the planned prototype workflow. Nagara is not connected
        to any municipal or government system.
      </p>
    </div>
  )
}

export default HowItWorks
