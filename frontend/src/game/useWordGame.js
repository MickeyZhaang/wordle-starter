import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { evaluateGuess } from './evaluateGuess.js'
import { createGameState, gameReducer } from './gameState.js'
import { loadGameState, saveGameState } from './persistence.js'
import { ANSWERS, VALID_GUESSES } from './words.js'

const INITIAL_WORD_LENGTH = 5

function createInitialGame() {
  return {
    answer: ANSWERS[INITIAL_WORD_LENGTH][0],
    currentGuess: '',
    guesses: [],
    phase: 'active',
    wordLength: INITIAL_WORD_LENGTH,
  }
}

function initializeGame() {
  return createGameState(loadGameState(createInitialGame()))
}

function getOutcome(currentGuess, answer, attemptCount, maximumAttempts) {
  if (currentGuess === answer) return 'won'
  if (attemptCount === maximumAttempts) return 'lost'
  return 'active'
}

function useWordGame() {
  const [state, dispatch] = useReducer(gameReducer, undefined, initializeGame)
  const [event, setEvent] = useState(null)
  const eventSequence = useRef(0)
  const { answer, currentGuess, guesses, keyboardState, pendingOutcome, phase, wordLength } = state
  const persistedPhase = phase === 'revealing' ? (pendingOutcome?.settledPhase ?? 'active') : phase

  // Persist durable game changes while excluding the current guess to avoid writes on every keystroke.
  useEffect(() => {
    saveGameState({
      answer,
      guesses,
      phase: persistedPhase,
      wordLength,
    })
  }, [answer, guesses, persistedPhase, wordLength])

  const emitEvent = useCallback((values) => {
    eventSequence.current += 1
    setEvent({ id: eventSequence.current, ...values })
  }, [])

  const typeLetter = useCallback((letter) => {
    dispatch({ type: 'type-letter', letter })
  }, [])

  const deleteLetter = useCallback(() => {
    dispatch({ type: 'delete-letter' })
  }, [])

  const submitGuess = useCallback(() => {
    if (phase !== 'active') return

    if (currentGuess.length !== wordLength) {
      emitEvent({
        duration: 1700,
        message: 'Not enough letters',
        row: guesses.length,
        type: 'invalid',
      })
      return
    }

    if (!VALID_GUESSES[wordLength].has(currentGuess)) {
      emitEvent({
        duration: 1700,
        message: 'Not in word list',
        row: guesses.length,
        type: 'invalid',
      })
      return
    }

    const attemptCount = guesses.length + 1
    const evaluation = evaluateGuess(currentGuess, answer)
    const settledPhase = getOutcome(currentGuess, answer, attemptCount, wordLength + 1)
    setEvent(null)
    dispatch({ type: 'guess-accepted', evaluation, guess: currentGuess, settledPhase })
  }, [answer, currentGuess, emitEvent, guesses.length, phase, wordLength])

  const completeReveal = useCallback(() => {
    if (!pendingOutcome) return
    dispatch({ type: 'complete-reveal' })

    if (pendingOutcome.settledPhase === 'won') {
      emitEvent({
        duration: 2400,
        message: pendingOutcome.attemptCount === 1 ? 'Genius' : 'Splendid',
        row: pendingOutcome.rowIndex,
        type: 'won',
      })
      return
    }

    if (pendingOutcome.settledPhase === 'lost') {
      emitEvent({
        duration: 4000,
        message: pendingOutcome.answer,
        row: pendingOutcome.rowIndex,
        type: 'lost',
      })
      return
    }

    setEvent(null)
  }, [emitEvent, pendingOutcome])

  const startGame = useCallback((nextWordLength) => {
    const answers = ANSWERS[nextWordLength]
    const nextAnswer = answers[Math.floor(Math.random() * answers.length)]
    setEvent(null)
    dispatch({ type: 'start-game', answer: nextAnswer, wordLength: nextWordLength })
  }, [])

  return {
    completeReveal,
    currentGuess,
    deleteLetter,
    event,
    guesses,
    keyboardState,
    phase,
    startGame,
    submitGuess,
    typeLetter,
    wordLength,
  }
}

export default useWordGame
