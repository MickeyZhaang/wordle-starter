import { useRef, useState } from 'react'
import { getGameHistory } from '../game/api.js'
import { HistoryIcon } from '../icons'
import GameHistoryDialog from './GameHistoryDialog.jsx'

const PAGE_SIZE = 12

function GameHistoryControl({
  currentGameId,
  disabled,
  onInputLockChange,
  onRestoreGame,
  playerId,
}) {
  const [error, setError] = useState(null)
  const [games, setGames] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [nextCursor, setNextCursor] = useState(null)
  const requestInFlight = useRef(false)

  const loadHistory = async (cursor, replace) => {
    if (requestInFlight.current) return
    requestInFlight.current = true
    setError(null)
    setIsLoading(true)

    try {
      const result = await getGameHistory(playerId, cursor, PAGE_SIZE)
      setGames((current) => (replace ? result.games : [...current, ...result.games]))
      setNextCursor(result.nextCursor ?? null)
    } catch (requestError) {
      setError(requestError?.message ?? 'Unable to load game history.')
    } finally {
      requestInFlight.current = false
      setIsLoading(false)
    }
  }

  const openDialog = () => {
    onInputLockChange(true)
    setIsDialogOpen(true)
    loadHistory(null, true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    onInputLockChange(false)
  }

  const restoreGame = (gameId) => {
    closeDialog()
    onRestoreGame(gameId)
  }

  return (
    <>
      <button
        aria-label="Game history"
        className="header-icon-button"
        disabled={disabled}
        onClick={openDialog}
        type="button"
      >
        <HistoryIcon />
      </button>
      <GameHistoryDialog
        currentGameId={currentGameId}
        error={error}
        games={games}
        isLoading={isLoading}
        isOpen={isDialogOpen}
        nextCursor={nextCursor}
        onClose={closeDialog}
        onLoadMore={() => loadHistory(nextCursor, false)}
        onRestore={restoreGame}
      />
    </>
  )
}

export default GameHistoryControl
