import {
  ArrowDownRight,
  ArrowRight,
  Check,
  ClipboardCheck,
  MapPin,
  MessageSquareText,
  ShieldCheck,
  UsersRound,
  Wrench,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import Badge from '../components/ui/Badge.jsx'
import Card from '../components/ui/Card.jsx'

const features = [
  {
    icon: MapPin,
    title: 'Report with context',
    description:
      'Share what needs attention and where it is, so the right local team can understand the issue.',
  },
  {
    icon: MessageSquareText,
    title: 'Follow every update',
    description:
      'A visible history keeps residents informed as a report is reviewed, assigned and worked on.',
  },
  {
    icon: ShieldCheck,
    title: 'Accountability by design',
    description:
      'Completion evidence is reviewed before an issue is marked resolved.',
  },
]

const journeySteps = [
  { label: 'Report', icon: MessageSquareText },
  { label: 'Review', icon: ClipboardCheck },
  { label: 'Repair', icon: Wrench },
  { label: 'Resolve', icon: Check },
]

function MapIllustration() {
  return (
    <div
      aria-label="Illustrative map preview showing a neighborhood and sample issue markers"
      className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-surface-muted"
      role="img"
    >
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 640 480"
      >
        <rect fill="var(--surface-muted)" height="480" width="640" />
        <path d="M-20 100 660 350M-10 390 650 110" fill="none" stroke="var(--surface)" strokeWidth="42" />
        <path d="M180 -20 400 500M500 -20 180 500" fill="none" stroke="var(--surface)" strokeWidth="30" />
        <path d="M-20 100 660 350M-10 390 650 110M180 -20 400 500M500 -20 180 500" fill="none" stroke="var(--border)" strokeDasharray="8 12" strokeWidth="2" />
        <path d="M50 30h80v55H50zM450 35h110v58H450zM34 290h100v54H34zM470 330h115v70H470z" fill="var(--accent)" opacity=".42" />
        <path d="M270 50h110v66H270zM265 365h130v55H265z" fill="var(--secondary)" opacity=".2" />
        <circle cx="280" cy="210" fill="var(--primary)" opacity=".12" r="52" />
        <circle cx="500" cy="220" fill="var(--primary)" opacity=".12" r="52" />
        <circle cx="280" cy="210" fill="var(--primary)" r="9" />
        <circle cx="500" cy="220" fill="var(--secondary)" r="9" />
        <circle cx="355" cy="320" fill="var(--primary)" r="7" />
        <text fill="var(--muted)" fontFamily="system-ui, sans-serif" fontSize="13" x="52" y="130">COMMUNITY PARK</text>
        <text fill="var(--muted)" fontFamily="system-ui, sans-serif" fontSize="13" x="440" y="300">LOCAL ROAD</text>
      </svg>
      <div className="absolute left-[38%] top-[39%] rounded-full border-4 border-surface bg-primary p-2 text-page shadow-lg">
        <MapPin aria-hidden="true" size={20} />
      </div>
      <div className="absolute left-[70%] top-[45%] rounded-full border-4 border-surface bg-secondary p-2 text-page shadow-lg">
        <Wrench aria-hidden="true" size={18} />
      </div>
      <div className="absolute bottom-3 left-3 rounded-lg border border-border bg-surface/95 px-3 py-2 text-xs font-medium text-muted shadow-sm">
        Illustrative neighborhood preview
      </div>
    </div>
  )
}

function Home() {
  return (
    <>
      <section className="overflow-hidden border-b border-border bg-page">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-24">
          <div>
            <Badge className="mb-6" variant="accent">A better way to speak up locally</Badge>
            <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Better streets start with{' '}
              <span className="text-primary">being heard.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
              Nagara helps communities report local infrastructure issues and
              follow the work from first report to reviewed resolution.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md border border-primary bg-primary px-5 text-lg font-medium text-page transition-[filter] hover:brightness-95 focus-visible:outline-focus sm:w-auto"
                to="/register"
              >
                Report an issue
                <ArrowRight aria-hidden="true" size={18} />
              </Link>
              <Link
                className="inline-flex min-h-12 w-full items-center justify-center rounded-md border border-primary bg-surface px-5 text-lg font-medium text-ink hover:bg-surface-muted focus-visible:outline-focus sm:w-auto"
                to="/how-it-works"
              >
                See how it works
              </Link>
            </div>
            <p className="mt-5 text-xs leading-5 text-muted">
              Academic prototype · Not an official government service
            </p>
          </div>
          <div className="relative mx-auto w-full max-w-xl">
            <MapIllustration />
            <Card className="absolute -bottom-5 right-3 flex max-w-xs items-center gap-3 p-4 shadow-lg sm:right-6">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
                <Check aria-hidden="true" size={20} />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">Progress you can follow</p>
                <p className="mt-1 text-xs text-muted">From report to reviewed resolution</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">A clearer civic connection</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Local issues deserve a visible path forward.
          </h2>
          <p className="mt-4 leading-7 text-muted">
            Nagara brings residents, municipal officers and field workers into
            one understandable process—without losing sight of who is doing what.
          </p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {features.map(({ icon: Icon, title, description }, index) => (
            <Card className="p-6" key={title}>
              <span className="flex size-12 items-center justify-center rounded-xl bg-surface-muted text-primary">
                <Icon aria-hidden="true" size={23} />
              </span>
              <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted">
                0{index + 1}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-ink">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">A process built for trust</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              One report. A team effort. A clear outcome.
            </h2>
            <p className="mt-4 max-w-xl leading-7 text-muted">
              Every report moves through review, assignment and field work.
              Resolution evidence is checked before the issue is officially closed.
            </p>
            <Link
              className="mt-6 inline-flex items-center gap-2 font-semibold text-primary hover:underline"
              to="/how-it-works"
            >
              Explore the steps
              <ArrowRight aria-hidden="true" size={17} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {journeySteps.map(({ label, icon: Icon }, index) => (
              <div className="relative flex flex-col items-center text-center" key={label}>
                <div className="flex size-14 items-center justify-center rounded-2xl border border-border bg-page text-primary">
                  <Icon aria-hidden="true" size={23} />
                </div>
                <p className="mt-3 text-sm font-semibold text-ink">{label}</p>
                {index < journeySteps.length - 1 && (
                  <ArrowDownRight aria-hidden="true" className="absolute -right-3 top-5 hidden text-muted sm:block" size={18} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 rounded-2xl border border-border bg-surface-muted p-7 sm:p-10 lg:flex-row lg:items-center">
          <div>
            <Badge variant="outline">Illustrative demo data</Badge>
            <h2 className="mt-4 text-2xl font-bold text-ink">A prototype for measurable civic follow-through</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              These sample figures are placeholders for the academic demo, not live service statistics.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-5 sm:gap-10">
            <div><p className="text-2xl font-bold text-primary">120+</p><p className="mt-1 text-xs text-muted">sample reports</p></div>
            <div><p className="text-2xl font-bold text-primary">8</p><p className="mt-1 text-xs text-muted">demo areas</p></div>
            <div><p className="text-2xl font-bold text-primary">3</p><p className="mt-1 text-xs text-muted">connected roles</p></div>
          </div>
        </div>
      </section>

      <section className="bg-primary text-page">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Your community. Your voice.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-page/85">
              See how a local concern can move through a transparent, accountable process.
            </p>
          </div>
          <Link className="inline-flex shrink-0 items-center gap-2 rounded-md bg-page px-5 py-3 font-semibold text-primary hover:brightness-95 focus-visible:outline-focus" to="/about">
            Get to know Nagara
            <ArrowRight aria-hidden="true" size={17} />
          </Link>
        </div>
      </section>
    </>
  )
}

export default Home
