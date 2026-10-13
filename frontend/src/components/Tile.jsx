function Tile({ isRevealing, letter, state, tileIndex }) {
  const animation = isRevealing ? 'flip' : letter && state === 'tbd' ? 'pop' : undefined

  return (
    <div
      className="tile"
      data-animation={animation}
      data-state={state}
      style={{ '--tile-index': tileIndex }}
      aria-label={letter ? `${letter}, ${state === 'tbd' ? 'not submitted' : state}` : 'empty'}
    >
      {letter}
    </div>
  )
}

export default Tile
