const KEY_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
]

function Keyboard({ letterStates, onKey }) {
  return (
    <div className="keyboard" aria-label="On-screen keyboard" role="group">
      {KEY_ROWS.map((row, rowIndex) => (
        <div className="keyboard-row" data-row={rowIndex + 1} key={row.join('')}>
          {row.map((key) => {
            const isAction = key === 'ENTER' || key === 'BACKSPACE'
            const label = key === 'BACKSPACE' ? 'Delete' : key

            return (
              <button
                aria-label={label}
                className={`key${isAction ? ' key--wide' : ''}`}
                data-state={letterStates[key]}
                key={key}
                onClick={() => onKey(key)}
                type="button"
              >
                {key === 'BACKSPACE' ? (
                  <span aria-hidden="true" className="backspace-icon">
                    ⌫
                  </span>
                ) : (
                  key
                )}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default Keyboard
