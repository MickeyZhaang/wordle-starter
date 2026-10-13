import { useState } from 'react'
import useWordGame from '../game/useWordGame.js'
import Board from './Board.jsx'
import GameHeader from './GameHeader.jsx'
import Keyboard from './Keyboard.jsx'
import Toast from './Toast.jsx'

function WordGame() {
  const game = useWordGame()
  const [inputLocked, setInputLocked] = useState(false)

  return (
    <main className="app-shell">
      <GameHeader
        onInputLockChange={setInputLocked}
        onStartGame={game.startGame}
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
          inputLocked={inputLocked}
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
