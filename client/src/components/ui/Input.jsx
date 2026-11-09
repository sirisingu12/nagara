import { useId } from 'react'

function Input({
  'aria-describedby': ariaDescribedBy,
  className = '',
  disabled = false,
  error,
  id,
  label,
  required = false,
  type = 'text',
  ...props
}) {
  const generatedId = useId()
  const inputId = id || generatedId
  const errorId = `${inputId}-error`
  const describedBy = [ariaDescribedBy, error ? errorId : null]
    .filter(Boolean)
    .join(' ') || undefined

  return (
    <div className="grid gap-1.5">
      {label && (
        <label className="text-sm font-medium text-ink" htmlFor={inputId}>
          {label}
          {required && (
            <span aria-hidden="true" className="ml-1 text-primary">
              *
            </span>
          )}
        </label>
      )}
      <input
        {...props}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        className={`min-h-10 w-full rounded-md border bg-surface px-3 py-2 text-ink placeholder:text-muted focus-visible:border-focus focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60 ${error ? 'border-primary' : 'border-border'} ${className}`}
        disabled={disabled}
        id={inputId}
        required={required}
        type={type}
      />
      {error && (
        <p
          aria-atomic="true"
          aria-live="polite"
          className="text-sm font-medium text-primary"
          id={errorId}
        >
          {error}
        </p>
      )}
    </div>
  )
}

export default Input
