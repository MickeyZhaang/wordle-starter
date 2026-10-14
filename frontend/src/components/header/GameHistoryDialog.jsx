import Dialog from '@wordle/components/ui/Dialog.jsx'

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
  return (
    <Dialog
      className="history-dialog"
      isOpen={isOpen}
      onClose={onClose}
      titleId="game-history-title"
    >
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
    </Dialog>
  )
}

export default GameHistoryDialog
