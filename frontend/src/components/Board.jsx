import Tile from './Tile.jsx'

function Board({
  currentGuess,
  guesses,
  invalidRow,
  maxAttempts,
  onRevealComplete,
  phase,
  winningRow,
  wordLength,
}) {
  const rows = Array.from({ length: maxAttempts }, (_, rowIndex) => {
    const submittedGuess = guesses[rowIndex]
    const isCurrentRow = rowIndex === guesses.length
    const word = submittedGuess?.word ?? (isCurrentRow ? currentGuess : '')
    const evaluation = submittedGuess?.evaluation ?? []
    const isRevealingRow = phase === 'revealing' && rowIndex === guesses.length - 1
    const rowClassName = [
      'board-row',
      invalidRow === rowIndex ? 'is-invalid' : '',
      winningRow === rowIndex ? 'is-winning' : '',
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <div
        className={rowClassName}
        key={rowIndex}
        role="group"
        aria-label={`Guess ${rowIndex + 1} of ${maxAttempts}`}
      >
        {Array.from({ length: wordLength }, (_, tileIndex) => (
          <Tile
            isRevealing={isRevealingRow}
            key={tileIndex}
            letter={word[tileIndex] ?? ''}
            onRevealComplete={
              isRevealingRow && tileIndex === wordLength - 1 ? onRevealComplete : undefined
            }
            state={evaluation[tileIndex] ?? (word[tileIndex] ? 'tbd' : 'empty')}
            tileIndex={tileIndex}
          />
        ))}
      </div>
    )
  })

  return (
    <div className="board-stage">
      <div
        className="board"
        data-length={wordLength}
        style={{ '--columns': wordLength, '--rows': maxAttempts }}
      >
        {rows}
      </div>
    </div>
  )
}

export default Board
