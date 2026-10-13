import { useCallback, useEffect } from 'react'
import { useGameActions, useGameState } from '../game/useGame.js'

const KEY_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
]

const TEXT_INPUT_SELECTOR = 'input, select, textarea, [contenteditable="true"]'
const ACTIVATION_SELECTOR = 'button, a[href]'

function Keyboard() {
  const { inputLocked, keyboardState, phase } = useGameState()
  const { deleteLetter, submitGuess, typeLetter } = useGameActions()

  const handleKey = useCallback(
    (key) => {
      if (phase !== 'active' || inputLocked) return

      if (key === 'ENTER') {
        submitGuess()
        return
      }

      if (key === 'BACKSPACE') {
        deleteLetter()
        return
      }

      if (/^[A-Z]$/.test(key)) typeLetter(key)
    },
    [deleteLetter, inputLocked, phase, submitGuess, typeLetter],
  )

  useEffect(() => {
    const onKeyDown = (event) => {
      if (inputLocked || event.metaKey || event.ctrlKey || event.altKey) return
      const key = event.key.toUpperCase()

      if (event.target instanceof Element) {
        if (event.target.closest(TEXT_INPUT_SELECTOR)) return
        if (key === 'ENTER' && event.target.closest(ACTIVATION_SELECTOR)) return
      }

      if (/^[A-Z]$/.test(key) || key === 'ENTER' || key === 'BACKSPACE') {
        event.preventDefault()
        handleKey(key)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleKey, inputLocked])

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
                data-state={keyboardState[key]}
                key={key}
                onClick={() => handleKey(key)}
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
