import { useGameActions, useGameState } from '../game/useGame.js'

function RestartButton() {
  const { wordLength } = useGameState()
  const { startGame } = useGameActions()

  return (
    <button
      aria-label="Restart game"
      className="header-icon-button"
      onClick={() => startGame(wordLength)}
      type="button"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M20 11a8 8 0 1 0-2.34 5.66M20 4v7h-7" />
      </svg>
    </button>
  )
}

export default RestartButton
