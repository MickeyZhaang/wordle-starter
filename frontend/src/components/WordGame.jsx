import { useState } from 'react'
import useWordGame from '../game/useWordGame.js'
import Board from './Board.jsx'
import GameHeader from './GameHeader.jsx'
import Keyboard from './Keyboard.jsx'
import Toast from './Toast.jsx'

function releasePointerFocus(event) {
  if (event.detail > 0 && event.target instanceof Element) event.target.closest('button')?.blur()
}

function WordGame() {
  const game = useWordGame()
  const [inputLocked, setInputLocked] = useState(false)

  return (
    <main aria-busy={game.requestPending} className="app-shell" onClick={releasePointerFocus}>
      <GameHeader
        currentGameId={game.gameId}
        disabled={game.requestPending}
        onInputLockChange={setInputLocked}
        onRestoreGame={game.restoreGame}
        onStartGame={game.startGame}
        playerId={game.playerId}
        remainingWordCount={game.remainingWordCount}
        wordLength={game.wordLength}
      />
      <section className="game" aria-label={`${game.wordLength}-letter word game`}>
        <Toast event={game.event} />
        <Board
          currentGuess={game.currentGuess}
          event={game.event}
          guesses={game.guesses}
          onRevealComplete={game.completeReveal}
          phase={game.phase}
          wordLength={game.wordLength}
        />
        <Keyboard
          inputLocked={inputLocked || game.requestPending || !game.hasGame}
          keyboardState={game.keyboardState}
          onDelete={game.deleteLetter}
          onSubmit={game.submitGuess}
          onType={game.typeLetter}
          phase={game.phase}
        />
      </section>
    </main>
  )
}

export default WordGame
