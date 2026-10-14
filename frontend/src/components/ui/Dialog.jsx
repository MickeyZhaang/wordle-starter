import { useEffect, useRef } from 'react'

const FOCUSABLE_SELECTOR = [
  'button:not(:disabled)',
  'a[href]',
  'input:not(:disabled)',
  'select:not(:disabled)',
  'textarea:not(:disabled)',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

function Dialog({ children, className, descriptionId, isOpen, onClose, titleId }) {
  const dialogRef = useRef(null)
  const closeButtonRef = useRef(null)

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
      return
    }

    if (event.key !== 'Tab') return
    const focusableElements = dialogRef.current?.querySelectorAll(FOCUSABLE_SELECTOR)
    if (!focusableElements?.length) return
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault()
      lastElement.focus()
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault()
      firstElement.focus()
    }
  }

  useEffect(() => {
    if (!isOpen) return undefined
    const previousFocus = document.activeElement
    closeButtonRef.current?.focus()

    return () => previousFocus?.focus()
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="dialog-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        className={['dialog', className].filter(Boolean).join(' ')}
        onKeyDown={handleKeyDown}
        ref={dialogRef}
        role="dialog"
      >
        <button
          aria-label="Close"
          className="dialog-close"
          onClick={onClose}
          ref={closeButtonRef}
          type="button"
        >
          ×
        </button>
        {children}
      </section>
    </div>
  )
}

export default Dialog
