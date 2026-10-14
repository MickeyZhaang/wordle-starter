import GameLengthControl from './GameLengthControl.jsx'
import RestartButton from './RestartButton.jsx'
import ThemeToggle from './ThemeToggle.jsx'

function GameHeader({ disabled, onInputLockChange, onStartGame, wordLength }) {
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
        <ThemeToggle />
        <RestartButton disabled={disabled} onRestart={() => onStartGame(wordLength)} />
      </div>
    </header>
  )
}

export default GameHeader
