import { deriveKeyboardState, mergeKeyboardState } from './evaluateGuess.js'

export function createGameState(game) {
  return {
    ...game,
    keyboardState: deriveKeyboardState(game.guesses),
    pendingOutcome: null,
  }
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'type-letter':
      if (state.phase !== 'active' || state.currentGuess.length >= state.wordLength) return state
      return { ...state, currentGuess: `${state.currentGuess}${action.letter}` }

    case 'delete-letter':
      if (state.phase !== 'active' || state.currentGuess.length === 0) return state
      return { ...state, currentGuess: state.currentGuess.slice(0, -1) }

    case 'guess-accepted': {
      if (state.phase !== 'active') return state
      const evaluation = action.evaluation
      const rowIndex = state.guesses.length
      const guesses = [...state.guesses, { word: action.guess, evaluation }]

      return {
        ...state,
        currentGuess: '',
        guesses,
        keyboardState: mergeKeyboardState(state.keyboardState, action.guess, evaluation),
        pendingOutcome: {
          answer: state.answer,
          attemptCount: guesses.length,
          rowIndex,
          settledPhase: action.settledPhase,
        },
        phase: 'revealing',
      }
    }

    case 'complete-reveal': {
      if (!state.pendingOutcome) return state
      const { settledPhase } = state.pendingOutcome

      return {
        ...state,
        pendingOutcome: null,
        phase: settledPhase,
      }
    }

    case 'start-game':
      return {
        answer: action.answer,
        currentGuess: '',
        guesses: [],
        keyboardState: {},
        pendingOutcome: null,
        phase: 'active',
        wordLength: action.wordLength,
      }

    default:
      return state
  }
}
