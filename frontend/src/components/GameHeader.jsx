import GameLengthControl from './GameLengthControl.jsx'
import RestartButton from './RestartButton.jsx'
import ThemeToggle from './ThemeToggle.jsx'

function GameHeader() {
  return (
    <header className="game-header">
      <div className="header-side header-side--left">
        <GameLengthControl />
      </div>
      <h1 className="wordmark">Wordle</h1>
      <div className="header-side header-side--right">
        <ThemeToggle />
        <RestartButton />
      </div>
    </header>
  )
}

export default GameHeader
