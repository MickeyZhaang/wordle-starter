import { useEffect, useMemo, useReducer } from 'react'
import { GameActionsContext, GameStateContext } from './gameContext.js'
import { createGameState, gameReducer } from './gameState.js'
import { loadGameState, saveGameState } from './persistence.js'
import { ANSWERS } from './words.js'

const INITIAL_WORD_LENGTH = 5

function createInitialGame() {
  return {
    wordLength: INITIAL_WORD_LENGTH,
    answer: ANSWERS[INITIAL_WORD_LENGTH][0],
    guesses: [],
    currentGuess: '',
    phase: 'active',
  }
}

function initializeGame() {
  return createGameState(loadGameState(createInitialGame()))
}

function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, initializeGame)
  const { answer, currentGuess, guesses, pendingOutcome, phase, wordLength } = state

  useEffect(() => {
    saveGameState({
      wordLength,
      answer,
      guesses,
      currentGuess,
      phase: phase === 'revealing' ? (pendingOutcome?.settledPhase ?? 'active') : phase,
    })
  }, [answer, currentGuess, guesses, pendingOutcome, phase, wordLength])

  const actions = useMemo(
    () => ({
      completeReveal: () => dispatch({ type: 'complete-reveal' }),
      deleteLetter: () => dispatch({ type: 'delete-letter' }),
      setInputLocked: (value) => dispatch({ type: 'set-input-locked', value }),
      startGame: (wordLength) => {
        const answers = ANSWERS[wordLength]
        const answer = answers[Math.floor(Math.random() * answers.length)]
        dispatch({ type: 'start-game', answer, wordLength })
      },
      submitGuess: () => dispatch({ type: 'submit-guess' }),
      typeLetter: (letter) => dispatch({ type: 'type-letter', letter }),
    }),
    [],
  )

  return (
    <GameActionsContext.Provider value={actions}>
      <GameStateContext.Provider value={state}>{children}</GameStateContext.Provider>
    </GameActionsContext.Provider>
  )
}

export default GameProvider
