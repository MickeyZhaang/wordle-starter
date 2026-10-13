import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import './App.css'
import Board from './components/Board.jsx'
import GameHeader from './components/GameHeader.jsx'
import Keyboard from './components/Keyboard.jsx'
import NewGameDialog from './components/NewGameDialog.jsx'
import Toast from './components/Toast.jsx'
import { ANSWERS, VALID_GUESSES } from './game/words.js'
import { evaluateGuess, mergeKeyboardState } from './game/evaluateGuess.js'

const INITIAL_WORD_LENGTH = 5
const THEME_STORAGE_KEY = 'wordle-theme'

function getInitialTheme() {
  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function App() {
  const [wordLength, setWordLength] = useState(INITIAL_WORD_LENGTH)
  const [answer, setAnswer] = useState(ANSWERS[INITIAL_WORD_LENGTH][0])
  const [guesses, setGuesses] = useState([])
  const [currentGuess, setCurrentGuess] = useState('')
  const [keyboardState, setKeyboardState] = useState({})
  const [phase, setPhase] = useState('active')
  const [toast, setToast] = useState('')
  const [invalidRow, setInvalidRow] = useState(null)
  const [winningRow, setWinningRow] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [theme, setTheme] = useState(getInitialTheme)
  const timers = useRef([])

  const maxAttempts = wordLength + 1

  const schedule = useCallback((callback, delay) => {
    const timer = window.setTimeout(callback, delay)
    timers.current.push(timer)
  }, [])

  const showToast = useCallback((message, duration = 1700) => {
    setToast(message)
    schedule(() => setToast(''), duration)
  }, [schedule])

  useEffect(() => () => {
    timers.current.forEach(window.clearTimeout)
  }, [])

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      'content',
      theme === 'dark' ? '#121213' : '#ffffff',
    )
  }, [theme])

  const startGame = useCallback((length) => {
    timers.current.forEach(window.clearTimeout)
    timers.current = []
    const answers = ANSWERS[length]
    const nextAnswer = answers[Math.floor(Math.random() * answers.length)]
    setWordLength(length)
    setAnswer(nextAnswer)
    setGuesses([])
    setCurrentGuess('')
    setKeyboardState({})
    setPhase('active')
    setToast('')
    setInvalidRow(null)
    setWinningRow(null)
    setIsDialogOpen(false)
  }, [])

  const rejectGuess = useCallback((message) => {
    setInvalidRow(guesses.length)
    showToast(message)
    schedule(() => setInvalidRow(null), 650)
  }, [guesses.length, schedule, showToast])

  const submitGuess = useCallback(() => {
    if (phase !== 'active') return
    if (currentGuess.length !== wordLength) {
      rejectGuess('Not enough letters')
      return
    }

    if (!VALID_GUESSES[wordLength].has(currentGuess)) {
      rejectGuess('Not in word list')
      return
    }

    const evaluation = evaluateGuess(currentGuess, answer)
    const rowIndex = guesses.length
    const nextGuesses = [...guesses, { word: currentGuess, evaluation }]
    const didWin = currentGuess === answer
    const didLose = !didWin && nextGuesses.length === maxAttempts
    const revealDuration = (wordLength - 1) * 280 + 620

    setGuesses(nextGuesses)
    setCurrentGuess('')
    setPhase('revealing')
    setKeyboardState((previous) => mergeKeyboardState(previous, currentGuess, evaluation))

    schedule(() => {
      if (didWin) {
        setPhase('won')
        setWinningRow(rowIndex)
        showToast(nextGuesses.length === 1 ? 'Genius' : 'Splendid', 2400)
        return
      }

      if (didLose) {
        setPhase('lost')
        showToast(answer, 4000)
        return
      }

      setPhase('active')
    }, revealDuration)
  }, [answer, currentGuess, guesses, maxAttempts, phase, rejectGuess, schedule, showToast, wordLength])

  const handleKey = useCallback((key) => {
    if (phase !== 'active' || isDialogOpen) return

    if (key === 'ENTER') {
      submitGuess()
      return
    }

    if (key === 'BACKSPACE') {
      setCurrentGuess((guess) => guess.slice(0, -1))
      return
    }

    if (/^[A-Z]$/.test(key)) {
      setCurrentGuess((guess) => guess.length < wordLength ? `${guess}${key}` : guess)
    }
  }, [isDialogOpen, phase, submitGuess, wordLength])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const key = event.key.toUpperCase()
      if (/^[A-Z]$/.test(key) || key === 'ENTER' || key === 'BACKSPACE') {
        event.preventDefault()
        handleKey(key)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleKey])

  return (
    <main className="app-shell">
      <GameHeader
        theme={theme}
        wordLength={wordLength}
        onChooseLength={() => setIsDialogOpen(true)}
        onRestart={() => startGame(wordLength)}
        onToggleTheme={() => setTheme((currentTheme) => currentTheme === 'dark' ? 'light' : 'dark')}
      />
      <section className="game" aria-label={`${wordLength}-letter word game`}>
        <Toast message={toast} />
        <Board
          currentGuess={currentGuess}
          guesses={guesses}
          invalidRow={invalidRow}
          maxAttempts={maxAttempts}
          phase={phase}
          winningRow={winningRow}
          wordLength={wordLength}
        />
        <Keyboard letterStates={keyboardState} onKey={handleKey} />
      </section>
      <NewGameDialog
        currentLength={wordLength}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onStart={startGame}
      />
    </main>
  )
}

export default App
