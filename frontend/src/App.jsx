import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import './App.css'
import Board from './components/Board.jsx'
import GameHeader from './components/GameHeader.jsx'
import Keyboard from './components/Keyboard.jsx'
import NewGameDialog from './components/NewGameDialog.jsx'
import Toast from './components/Toast.jsx'
import { deriveKeyboardState, evaluateGuess, mergeKeyboardState } from './game/evaluateGuess.js'
import { loadGameState, saveGameState } from './game/persistence.js'
import { ANSWERS, VALID_GUESSES } from './game/words.js'

const INITIAL_WORD_LENGTH = 5
const THEME_STORAGE_KEY = 'wordle-theme'
const TEXT_INPUT_SELECTOR = 'input, select, textarea, [contenteditable="true"]'
const ACTIVATION_SELECTOR = 'button, a[href]'

function createInitialGame() {
  return {
    wordLength: INITIAL_WORD_LENGTH,
    answer: ANSWERS[INITIAL_WORD_LENGTH][0],
    guesses: [],
    currentGuess: '',
    phase: 'active',
  }
}

function getInitialTheme() {
  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme
  } catch {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function saveTheme(theme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    return true
  } catch {
    return false
  }
}

function App() {
  const [initialGame] = useState(() => loadGameState(createInitialGame()))
  const [wordLength, setWordLength] = useState(initialGame.wordLength)
  const [answer, setAnswer] = useState(initialGame.answer)
  const [guesses, setGuesses] = useState(initialGame.guesses)
  const [currentGuess, setCurrentGuess] = useState(initialGame.currentGuess)
  const [keyboardState, setKeyboardState] = useState(() => deriveKeyboardState(initialGame.guesses))
  const [phase, setPhase] = useState(initialGame.phase)
  const [toast, setToast] = useState('')
  const [invalidRow, setInvalidRow] = useState(null)
  const [winningRow, setWinningRow] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [theme, setTheme] = useState(getInitialTheme)
  const timers = useRef(new Set())
  const toastTimer = useRef(null)
  const invalidTimer = useRef(null)
  const pendingReveal = useRef(null)

  const maxAttempts = wordLength + 1

  const clearTimer = useCallback((timer) => {
    if (timer === null) return
    window.clearTimeout(timer)
    timers.current.delete(timer)
  }, [])

  const clearAllTimers = useCallback(() => {
    timers.current.forEach(window.clearTimeout)
    timers.current.clear()
    toastTimer.current = null
    invalidTimer.current = null
  }, [])

  const schedule = useCallback((callback, delay) => {
    const timer = window.setTimeout(() => {
      timers.current.delete(timer)
      callback()
    }, delay)
    timers.current.add(timer)
    return timer
  }, [])

  const showToast = useCallback(
    (message, duration = 1700) => {
      clearTimer(toastTimer.current)
      setToast(message)
      toastTimer.current = schedule(() => {
        toastTimer.current = null
        setToast('')
      }, duration)
    },
    [clearTimer, schedule],
  )

  useEffect(() => {
    return clearAllTimers
  }, [clearAllTimers])

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    saveTheme(theme)
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#121213' : '#ffffff')
  }, [theme])

  useEffect(() => {
    if (phase === 'revealing') return
    saveGameState({ wordLength, answer, guesses, currentGuess, phase })
  }, [answer, currentGuess, guesses, phase, wordLength])

  const openDialog = useCallback(() => setIsDialogOpen(true), [])
  const closeDialog = useCallback(() => setIsDialogOpen(false), [])
  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
  }, [])

  const startGame = useCallback(
    (length) => {
      clearAllTimers()
      pendingReveal.current = null
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
    },
    [clearAllTimers],
  )

  const restartGame = useCallback(() => startGame(wordLength), [startGame, wordLength])

  const rejectGuess = useCallback(
    (message) => {
      clearTimer(invalidTimer.current)
      setInvalidRow(guesses.length)
      showToast(message)
      invalidTimer.current = schedule(() => {
        invalidTimer.current = null
        setInvalidRow(null)
      }, 650)
    },
    [clearTimer, guesses.length, schedule, showToast],
  )

  const completeReveal = useCallback(() => {
    const result = pendingReveal.current
    if (!result) return
    pendingReveal.current = null

    if (result.settledPhase === 'won') {
      setPhase('won')
      setWinningRow(result.rowIndex)
      showToast(result.attemptCount === 1 ? 'Genius' : 'Splendid', 2400)
      return
    }

    if (result.settledPhase === 'lost') {
      setPhase('lost')
      showToast(result.answer, 4000)
      return
    }

    setPhase('active')
  }, [showToast])

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
    const settledPhase = didWin ? 'won' : didLose ? 'lost' : 'active'

    pendingReveal.current = {
      answer,
      attemptCount: nextGuesses.length,
      settledPhase,
      rowIndex,
    }
    saveGameState({
      wordLength,
      answer,
      guesses: nextGuesses,
      currentGuess: '',
      phase: settledPhase,
    })
    setGuesses(nextGuesses)
    setCurrentGuess('')
    setPhase('revealing')
    setKeyboardState((previous) => mergeKeyboardState(previous, currentGuess, evaluation))
  }, [answer, currentGuess, guesses, maxAttempts, phase, rejectGuess, wordLength])

  const handleKey = useCallback(
    (key) => {
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
        setCurrentGuess((guess) => (guess.length < wordLength ? `${guess}${key}` : guess))
      }
    },
    [isDialogOpen, phase, submitGuess, wordLength],
  )

  useEffect(() => {
    const onKeyDown = (event) => {
      if (isDialogOpen || event.metaKey || event.ctrlKey || event.altKey) return
      const key = event.key.toUpperCase()
      if (event.target instanceof Element) {
        if (event.target.closest(TEXT_INPUT_SELECTOR)) return
        if (key === 'ENTER' && event.target.closest(ACTIVATION_SELECTOR)) return
      }
      if (/^[A-Z]$/.test(key) || key === 'ENTER' || key === 'BACKSPACE') {
        event.preventDefault()
        handleKey(key)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleKey, isDialogOpen])

  return (
    <main className="app-shell">
      <GameHeader
        theme={theme}
        wordLength={wordLength}
        onChooseLength={openDialog}
        onRestart={restartGame}
        onToggleTheme={toggleTheme}
      />
      <section className="game" aria-label={`${wordLength}-letter word game`}>
        <Toast message={toast} />
        <Board
          currentGuess={currentGuess}
          guesses={guesses}
          invalidRow={invalidRow}
          maxAttempts={maxAttempts}
          onRevealComplete={completeReveal}
          phase={phase}
          winningRow={winningRow}
          wordLength={wordLength}
        />
        <Keyboard letterStates={keyboardState} onKey={handleKey} />
      </section>
      <NewGameDialog
        currentLength={wordLength}
        isOpen={isDialogOpen}
        onClose={closeDialog}
        onStart={startGame}
      />
    </main>
  )
}

export default App
