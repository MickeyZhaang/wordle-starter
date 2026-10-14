import GameHistoryControl from './GameHistoryControl.jsx'
import GameLengthControl from './GameLengthControl.jsx'
import RemainingWordCount from './RemainingWordCount.jsx'
import RestartButton from './RestartButton.jsx'
import ThemeToggle from './ThemeToggle.jsx'

function GameHeader({
  currentGameId,
  disabled,
  onRestoreGame,
  onStartGame,
  playerId,
  remainingWordCount,
  wordLength,
}) {
  return (
    <header className="game-header">
      <div className="header-side header-side--left">
        <GameLengthControl disabled={disabled} onStartGame={onStartGame} wordLength={wordLength} />
        {Number.isInteger(remainingWordCount) && (
          <RemainingWordCount key={currentGameId} value={remainingWordCount} />
        )}
      </div>
      <h1 className="wordmark">Wordle</h1>
      <div className="header-side header-side--right">
        <GameHistoryControl
          currentGameId={currentGameId}
          disabled={disabled}
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
