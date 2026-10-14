import { useState } from 'react'
import NewGameDialog from './NewGameDialog.jsx'

function GameLengthControl({ disabled, onStartGame, wordLength }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const openDialog = () => {
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
  }

  const handleStart = (length) => {
    setIsDialogOpen(false)
    onStartGame(length)
  }

  return (
    <>
      <button className="header-text-button" disabled={disabled} onClick={openDialog} type="button">
        New game
      </button>
      <NewGameDialog
        currentLength={wordLength}
        isOpen={isDialogOpen}
        onClose={closeDialog}
        onStart={handleStart}
      />
    </>
  )
}

export default GameLengthControl
