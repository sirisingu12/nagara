const SIZE_CLASSES = {
  sm: 'size-5 border-2',
  md: 'size-8 border-[3px]',
  lg: 'size-12 border-4',
}

function Loading({ message, size = 'md', className = '', fullScreen = false }) {
  const spinnerSize = SIZE_CLASSES[size] || SIZE_CLASSES.md
  const accessibleLabel = message || 'Loading'
  const containerClasses = fullScreen
    ? 'flex min-h-screen items-center justify-center'
    : 'flex items-center justify-center'

  return (
    <div
      aria-label={accessibleLabel}
      className={`${containerClasses} gap-3 text-muted ${className}`}
      role="status"
    >
      <span
        aria-hidden="true"
        className={`animate-spin rounded-full border-primary border-r-transparent ${spinnerSize}`}
      />
      {message && <span>{message}</span>}
    </div>
  )
}

export default Loading
