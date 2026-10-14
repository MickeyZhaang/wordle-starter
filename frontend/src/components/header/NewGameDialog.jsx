import Dialog from '@wordle/components/ui/Dialog.jsx'

const LENGTHS = [5, 6, 7, 8]

function NewGameDialog({ currentLength, isOpen, onClose, onStart }) {
  return (
    <Dialog
      descriptionId="new-game-description"
      isOpen={isOpen}
      onClose={onClose}
      titleId="new-game-title"
    >
      <p className="dialog-kicker">New game</p>
      <h2 id="new-game-title">Choose a word length</h2>
      <p className="dialog-copy" id="new-game-description">
        You’ll get one more guess than the number of letters.
      </p>
      <div className="length-options">
        {LENGTHS.map((length) => (
          <button
            className={length === currentLength ? 'length-option is-current' : 'length-option'}
            key={length}
            onClick={() => onStart(length)}
            type="button"
          >
            <strong>{length}</strong>
            <span>{length + 1} guesses</span>
          </button>
        ))}
      </div>
    </Dialog>
  )
}

export default NewGameDialog
