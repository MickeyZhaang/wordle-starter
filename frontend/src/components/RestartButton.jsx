import { RestartIcon } from '../icons'

function RestartButton({ onRestart }) {
  return (
    <button
      aria-label="Restart game"
      className="header-icon-button"
      onClick={onRestart}
      type="button"
    >
      <RestartIcon />
    </button>
  )
}

export default RestartButton
