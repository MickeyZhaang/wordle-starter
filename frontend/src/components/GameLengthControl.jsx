import { useCallback, useState } from 'react'
import NewGameDialog from './NewGameDialog.jsx'

function GameLengthControl({ onInputLockChange, onStartGame, wordLength }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const openDialog = () => {
    onInputLockChange(true)
    setIsDialogOpen(true)
  }

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false)
    onInputLockChange(false)
  }, [onInputLockChange])

  const handleStart = (length) => {
    setIsDialogOpen(false)
    onInputLockChange(false)
    onStartGame(length)
  }

  return (
    <>
      <button className="header-text-button" onClick={openDialog} type="button">
        {wordLength} letters
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
