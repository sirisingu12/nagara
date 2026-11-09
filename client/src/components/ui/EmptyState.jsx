function EmptyState({
  title,
  description,
  action,
  icon,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface p-8 text-center ${className}`}
    >
      {icon && (
        <span aria-hidden="true" className="text-muted">
          {icon}
        </span>
      )}
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      {description && <p className="max-w-prose text-sm text-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export default EmptyState
