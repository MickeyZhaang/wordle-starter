import GameLengthControl from './GameLengthControl.jsx'
import RestartButton from './RestartButton.jsx'
import ThemeToggle from './ThemeToggle.jsx'

function GameHeader({ onInputLockChange, onStartGame, wordLength }) {
  return (
    <header className="game-header">
      <div className="header-side header-side--left">
        <GameLengthControl
          onInputLockChange={onInputLockChange}
          onStartGame={onStartGame}
          wordLength={wordLength}
        />
      </div>
      <h1 className="wordmark">Wordle</h1>
      <div className="header-side header-side--right">
        <ThemeToggle />
        <RestartButton onRestart={() => onStartGame(wordLength)} />
      </div>
    </header>
  )
}

export default GameHeader
