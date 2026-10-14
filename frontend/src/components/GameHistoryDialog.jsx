import { useEffect, useRef } from 'react'

const FOCUSABLE_SELECTOR = [
  'button:not(:disabled)',
  'a[href]',
  'input:not(:disabled)',
  'select:not(:disabled)',
  'textarea:not(:disabled)',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

const DATE_FORMATTER = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  month: 'short',
})

const STATUS_LABELS = {
  active: 'In progress',
  lost: 'Lost',
  won: 'Won',
}

function GameHistoryDialog({
  currentGameId,
  error,
  games,
  isLoading,
  isOpen,
  nextCursor,
  onClose,
  onLoadMore,
  onRestore,
}) {
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
        aria-labelledby="game-history-title"
        aria-modal="true"
        className="dialog history-dialog"
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
        <p className="dialog-kicker">Your games</p>
        <h2 id="game-history-title">Game history</h2>
        <div className="history-list" aria-busy={isLoading}>
          {games.map((game) => {
            const isCurrent = game.id === currentGameId

            return (
              <button
                className="history-game"
                disabled={isCurrent}
                key={game.id}
                onClick={() => onRestore(game.id)}
                type="button"
              >
                <span className="history-game-main">
                  <strong>{game.answer ?? `${game.wordLength} letters`}</strong>
                  <span>{DATE_FORMATTER.format(new Date(game.createdAt))}</span>
                </span>
                <span className={`history-status history-status--${game.status}`}>
                  {isCurrent ? 'Current' : STATUS_LABELS[game.status]}
                </span>
                <span className="history-attempts">
                  {game.version}/{game.maxAttempts}
                </span>
              </button>
            )
          })}
          {!isLoading && games.length === 0 && !error && (
            <p className="history-empty">No games yet.</p>
          )}
          {error && <p className="history-error">{error}</p>}
        </div>
        {nextCursor && (
          <button
            className="history-load-more"
            disabled={isLoading}
            onClick={onLoadMore}
            type="button"
          >
            {isLoading ? 'Loading…' : 'Load more'}
          </button>
        )}
      </section>
    </div>
  )
}

export default GameHistoryDialog
