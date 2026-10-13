import './App.css'
import WordGame from './components/WordGame.jsx'
import GameProvider from './game/GameProvider.jsx'

function App() {
  return (
    <GameProvider>
      <WordGame />
    </GameProvider>
  )
}

export default App
