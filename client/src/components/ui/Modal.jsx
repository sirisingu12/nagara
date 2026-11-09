import { useEffect, useId, useRef } from 'react'

function Modal({
  isOpen = false,
  onClose,
  title,
  children,
  className = '',
  closeOnOverlayClick = true,
  closeOnEscape = true,
}) {
  const dialogRef = useRef(null)
  const titleId = useId()

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const previouslyFocusedElement = document.activeElement
    const previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()

    const handleKeyDown = (event) => {
      if (closeOnEscape && event.key === 'Escape') {
        onClose?.()
      }

      if (event.key !== 'Tab') {
        return
      }

      const dialog = dialogRef.current
      if (!dialog) {
        return
      }

      const focusableElements = Array.from(
        dialog.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]',
        ),
      ).filter(
        (element) =>
          element.tabIndex >= 0 &&
          element.getAttribute('aria-hidden') !== 'true' &&
          element.getClientRects().length > 0,
      )

      if (focusableElements.length === 0) {
        event.preventDefault()
        dialog.focus()
        return
      }

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      const activeElement = document.activeElement

      if (
        event.shiftKey &&
        (activeElement === firstElement ||
          activeElement === dialog ||
          !dialog.contains(activeElement))
      ) {
        event.preventDefault()
        lastElement.focus()
      } else if (
        !event.shiftKey &&
        (activeElement === lastElement || !dialog.contains(activeElement))
      ) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousBodyOverflow

      if (previouslyFocusedElement instanceof HTMLElement) {
        previouslyFocusedElement.focus()
      }
    }
  }, [isOpen, closeOnEscape, onClose])

  if (!isOpen) {
    return null
  }

  const handleOverlayClick = (event) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose?.()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink/50 p-4"
      onClick={handleOverlayClick}
    >
      <section
        aria-labelledby={titleId}
        aria-modal="true"
        className={`max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-surface p-5 text-ink shadow-xl focus-visible:outline-focus ${className}`}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <header className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold text-ink" id={titleId}>
            {title}
          </h2>
          <button
            aria-label="Close dialog"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-ink hover:bg-surface-muted focus-visible:outline-focus"
            onClick={onClose}
            type="button"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </header>
        {children}
      </section>
    </div>
  )
}

export default Modal
