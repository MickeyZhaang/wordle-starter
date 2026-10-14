import { useEffect, useRef } from 'react'

const LENGTHS = [5, 6, 7, 8]
const FOCUSABLE_SELECTOR = [
  'button:not(:disabled)',
  'a[href]',
  'input:not(:disabled)',
  'select:not(:disabled)',
  'textarea:not(:disabled)',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

function NewGameDialog({ currentLength, isOpen, onClose, onStart }) {
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
        aria-describedby="new-game-description"
        aria-labelledby="new-game-title"
        aria-modal="true"
        className="dialog"
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
        <p className="dialog-kicker">New game</p>
        <h2 id="new-game-title">Choose a word length</h2>
        <p className="dialog-copy" id="new-game-description">
          You’ll get one more guess than the number of letters.
        </p>
        <div className="length-options">
          {LENGTHS.map((length) => (
            <button
              className={length === currentLength ? 'length-option is-current' : 'length-option'}
              key={length}
              onClick={() => onStart(length)}
              type="button"
            >
              <strong>{length}</strong>
              <span>{length + 1} guesses</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

export default NewGameDialog
