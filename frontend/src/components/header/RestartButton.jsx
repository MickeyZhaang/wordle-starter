import { RestartIcon } from '@wordle/icons'

function RestartButton({ disabled, onRestart }) {
  return (
    <button
      aria-label="Restart game"
      className="header-icon-button"
      disabled={disabled}
      onClick={onRestart}
      type="button"
    >
      <RestartIcon />
    </button>
  )
}

export default RestartButton
