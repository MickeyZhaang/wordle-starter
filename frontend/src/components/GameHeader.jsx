import GameHistoryControl from './GameHistoryControl.jsx'
import GameLengthControl from './GameLengthControl.jsx'
import RestartButton from './RestartButton.jsx'
import ThemeToggle from './ThemeToggle.jsx'

function GameHeader({
  currentGameId,
  disabled,
  onInputLockChange,
  onRestoreGame,
  onStartGame,
  playerId,
  wordLength,
}) {
  return (
    <header className="game-header">
      <div className="header-side header-side--left">
        <GameLengthControl
          disabled={disabled}
          onInputLockChange={onInputLockChange}
          onStartGame={onStartGame}
          wordLength={wordLength}
        />
      </div>
      <h1 className="wordmark">Wordle</h1>
      <div className="header-side header-side--right">
        <GameHistoryControl
          currentGameId={currentGameId}
          disabled={disabled}
          onInputLockChange={onInputLockChange}
          onRestoreGame={onRestoreGame}
          playerId={playerId}
        />
        <ThemeToggle />
        <RestartButton disabled={disabled} onRestart={() => onStartGame(wordLength)} />
      </div>
    </header>
  )
}

export default GameHeader
