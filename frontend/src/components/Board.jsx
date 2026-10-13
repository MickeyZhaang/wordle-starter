import { useCallback, useEffect, useState } from 'react'
import { useGameActions, useGameState } from '../game/useGame.js'
import Tile from './Tile.jsx'

function Board() {
  const { currentGuess, guesses, invalidEvent, pendingOutcome, phase, wordLength } = useGameState()
  const { completeReveal } = useGameActions()
  const [expiredInvalidEventId, setExpiredInvalidEventId] = useState(null)
  const [winningRow, setWinningRow] = useState(null)
  const maxAttempts = wordLength + 1
  const invalidRow = invalidEvent?.id === expiredInvalidEventId ? null : invalidEvent?.row

  useEffect(() => {
    if (!invalidEvent) return undefined
    const timer = window.setTimeout(() => setExpiredInvalidEventId(invalidEvent.id), 650)
    return () => window.clearTimeout(timer)
  }, [invalidEvent])

  const handleRevealComplete = useCallback(() => {
    if (pendingOutcome?.settledPhase === 'won') setWinningRow(guesses.length - 1)
    completeReveal()
  }, [completeReveal, guesses.length, pendingOutcome?.settledPhase])

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
              isRevealingRow && tileIndex === wordLength - 1 ? handleRevealComplete : undefined
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
