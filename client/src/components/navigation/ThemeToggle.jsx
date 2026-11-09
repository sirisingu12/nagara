import { useTheme } from '../../contexts/ThemeContext.jsx'

function ThemeToggle() {
  const { preference, setThemePreference } = useTheme()

  return (
    <label className="inline-flex items-center gap-3 text-sm text-muted">
      <span>Theme</span>
      <select
        aria-label="Theme preference"
        className="rounded-md border border-border bg-surface px-3 py-2 text-ink focus-visible:outline-focus"
        onChange={(event) => setThemePreference(event.target.value)}
        value={preference}
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </label>
  )
}

export default ThemeToggle
