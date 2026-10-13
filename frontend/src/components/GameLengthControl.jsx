import { useCallback, useState } from 'react'
import { useGameActions, useGameState } from '../game/useGame.js'
import NewGameDialog from './NewGameDialog.jsx'

function GameLengthControl() {
  const { wordLength } = useGameState()
  const { setInputLocked, startGame } = useGameActions()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const openDialog = useCallback(() => {
    setInputLocked(true)
    setIsDialogOpen(true)
  }, [setInputLocked])

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false)
    setInputLocked(false)
  }, [setInputLocked])

  const handleStart = useCallback(
    (length) => {
      setIsDialogOpen(false)
      startGame(length)
    },
    [startGame],
  )

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
