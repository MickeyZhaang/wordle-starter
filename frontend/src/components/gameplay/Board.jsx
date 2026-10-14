import BoardRow from './BoardRow.jsx'

function Board({ currentGuess, event, guesses, onRevealComplete, phase, wordLength }) {
  const maxAttempts = wordLength + 1
  const invalidEvent = event?.type === 'invalid' ? event : null
  const winningRow = event?.type === 'won' ? event.row : null

  const boardRows = Array.from({ length: maxAttempts }, (_, rowIndex) => (
    <BoardRow
      currentGuess={rowIndex === guesses.length ? currentGuess : ''}
      guess={guesses[rowIndex]}
      invalidEvent={invalidEvent?.row === rowIndex ? invalidEvent : null}
      isRevealing={phase === 'revealing' && rowIndex === guesses.length - 1}
      isWinning={winningRow === rowIndex}
      key={rowIndex}
      maxAttempts={maxAttempts}
      onRevealComplete={onRevealComplete}
      rowIndex={rowIndex}
      wordLength={wordLength}
    />
  ))

  return (
    <div className="board-stage">
      <div
        className="board"
        data-length={wordLength}
        style={{ '--columns': wordLength, '--rows': maxAttempts }}
      >
        {boardRows}
      </div>
    </div>
  )
}

export default Board
