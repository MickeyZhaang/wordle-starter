import { useEffect, useRef } from 'react'

const LENGTHS = [5, 6, 7, 8]

function NewGameDialog({ currentLength, isOpen, onClose, onStart }) {
  const closeButtonRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return undefined
    closeButtonRef.current?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="dialog-overlay" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <section className="dialog" role="dialog" aria-modal="true" aria-labelledby="new-game-title">
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
        <p className="dialog-copy">You’ll get one more guess than the number of letters.</p>
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
