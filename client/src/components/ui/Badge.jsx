const VARIANT_CLASSES = {
  neutral: 'border border-border bg-surface-muted text-ink',
  primary: 'border border-primary bg-primary text-page',
  secondary: 'border border-secondary bg-secondary text-page',
  accent: 'border border-accent bg-accent text-ink',
  outline: 'border border-border bg-surface text-ink',
}

const SIZE_CLASSES = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
}

function Badge({
  children,
  className = '',
  size = 'sm',
  variant = 'neutral',
  ...props
}) {
  const variantClasses = VARIANT_CLASSES[variant] || VARIANT_CLASSES.neutral
  const sizeClasses = SIZE_CLASSES[size] || SIZE_CLASSES.sm

  return (
    <span
      {...props}
      className={`inline-flex items-center rounded-full font-medium leading-none ${variantClasses} ${sizeClasses} ${className}`}
    >
      {children}
    </span>
  )
}

export default Badge
