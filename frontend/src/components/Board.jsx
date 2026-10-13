import { useState } from 'react'
import Tile from './Tile.jsx'

function Board({ currentGuess, event, guesses, onRevealComplete, phase, wordLength }) {
  const [expiredInvalidEventId, setExpiredInvalidEventId] = useState(null)
  const maxAttempts = wordLength + 1
  const invalidEvent = event?.type === 'invalid' ? event : null
  const invalidRow = invalidEvent?.id === expiredInvalidEventId ? null : invalidEvent?.row
  const winningRow = event?.type === 'won' ? event.row : null

  const handleInvalidAnimationEnd = (animationEvent) => {
    if (animationEvent.animationName === 'shake' && invalidEvent) {
      setExpiredInvalidEventId(invalidEvent.id)
    }
  }

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
        onAnimationEnd={invalidRow === rowIndex ? handleInvalidAnimationEnd : undefined}
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
