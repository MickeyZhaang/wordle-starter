import { useState } from 'react'
import Tile from './Tile.jsx'

function BoardRow({
  currentGuess,
  guess,
  invalidEvent,
  isRevealing,
  isWinning,
  maxAttempts,
  onRevealComplete,
  rowIndex,
  wordLength,
}) {
  const [expiredInvalidEventId, setExpiredInvalidEventId] = useState(null)
  const word = guess?.word ?? currentGuess
  const evaluation = guess?.evaluation ?? []
  const isInvalid = Boolean(invalidEvent && invalidEvent.id !== expiredInvalidEventId)
  const rowClassName = ['board-row', isInvalid ? 'is-invalid' : '', isWinning ? 'is-winning' : '']
    .filter(Boolean)
    .join(' ')

  const handleInvalidAnimationEnd = (animationEvent) => {
    if (animationEvent.target !== animationEvent.currentTarget || !invalidEvent) return
    setExpiredInvalidEventId(invalidEvent.id)
  }

  return (
    <div
      className={rowClassName}
      onAnimationEnd={isInvalid ? handleInvalidAnimationEnd : undefined}
      role="group"
      aria-label={`Guess ${rowIndex + 1} of ${maxAttempts}`}
    >
      {Array.from({ length: wordLength }, (_, tileIndex) => (
        <Tile
          isRevealing={isRevealing}
          key={tileIndex}
          letter={word[tileIndex] ?? ''}
          onRevealComplete={
            isRevealing && tileIndex === wordLength - 1 ? onRevealComplete : undefined
          }
          state={evaluation[tileIndex] ?? (word[tileIndex] ? 'tbd' : 'empty')}
          tileIndex={tileIndex}
        />
      ))}
    </div>
  )
}

export default BoardRow
