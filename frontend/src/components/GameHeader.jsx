function GameHeader({ onChooseLength, onRestart, onToggleTheme, theme, wordLength }) {
  return (
    <header className="game-header">
      <div className="header-side header-side--left">
        <button className="header-text-button" onClick={onChooseLength} type="button">
          {wordLength} letters
        </button>
      </div>
      <h1 className="wordmark">Wordle</h1>
      <div className="header-side header-side--right">
        <button
          className="header-icon-button"
          onClick={onToggleTheme}
          type="button"
          aria-label={theme === 'dark' ? 'Use light mode' : 'Use dark mode'}
          aria-pressed={theme === 'dark'}
        >
          {theme === 'dark' ? (
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41" />
            </svg>
          ) : (
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M20.7 15.5A8.5 8.5 0 0 1 8.5 3.3 8.5 8.5 0 1 0 20.7 15.5Z" />
            </svg>
          )}
        </button>
        <button className="header-icon-button" onClick={onRestart} type="button" aria-label="Restart game">
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M20 11a8 8 0 1 0-2.34 5.66M20 4v7h-7" />
          </svg>
        </button>
      </div>
    </header>
  )
}

export default GameHeader
