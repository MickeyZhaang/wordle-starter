function Tile({ isRevealing, letter, onRevealComplete, state, tileIndex }) {
  const animation = isRevealing ? 'flip' : letter && state === 'tbd' ? 'pop' : undefined

  const handleAnimationEnd = (event) => {
    if (event.animationName === 'flip') onRevealComplete?.()
  }

  return (
    <div
      className="tile"
      data-animation={animation}
      data-state={state}
      onAnimationEnd={handleAnimationEnd}
      role="img"
      style={{ '--tile-index': tileIndex }}
      aria-label={letter ? `${letter}, ${state === 'tbd' ? 'not submitted' : state}` : 'empty'}
    >
      {letter}
    </div>
  )
}

export default Tile
