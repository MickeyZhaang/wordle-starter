import { useGameState } from '../game/useGame.js'
import Board from './Board.jsx'
import GameHeader from './GameHeader.jsx'
import Keyboard from './Keyboard.jsx'
import Toast from './Toast.jsx'

function WordGame() {
  const { gameId, wordLength } = useGameState()

  return (
    <main className="app-shell">
      <GameHeader />
      <section className="game" aria-label={`${wordLength}-letter word game`}>
        <Toast />
        <Board key={gameId} />
        <Keyboard />
      </section>
    </main>
  )
}

export default WordGame
