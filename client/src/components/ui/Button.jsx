const VARIANT_CLASSES = {
  primary:
    'border border-primary bg-primary text-page hover:brightness-95',
  secondary:
    'border border-secondary bg-secondary text-page hover:brightness-95',
  outline:
    'border border-primary bg-surface text-ink hover:bg-surface-muted',
  danger: 'border border-ink bg-ink text-page hover:opacity-90',
}

const SIZE_CLASSES = {
  sm: 'min-h-8 px-3 text-sm',
  md: 'min-h-10 px-4 text-base',
  lg: 'min-h-12 px-5 text-lg',
}

function Button({
  children,
  className = '',
  disabled = false,
  loading = false,
  size = 'md',
  type = 'button',
  variant = 'primary',
  ...props
}) {
  const isDisabled = disabled || loading
  const variantClasses = VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary
  const sizeClasses = SIZE_CLASSES[size] || SIZE_CLASSES.md

  return (
    <button
      {...props}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition-[filter,opacity,background-color] focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses} ${sizeClasses} ${className}`}
      disabled={isDisabled}
      type={type}
    >
      {loading && (
        <>
          <span
            aria-hidden="true"
            className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
          />
          <span className="sr-only">Loading</span>
        </>
      )}
      {children}
    </button>
  )
}

export default Button
