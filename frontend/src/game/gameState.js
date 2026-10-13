import { deriveKeyboardState, evaluateGuess, mergeKeyboardState } from './evaluateGuess.js'
import { VALID_GUESSES } from './words.js'

function createEvent(state, values) {
  const id = state.eventSequence + 1
  return {
    eventSequence: id,
    event: { id, ...values },
  }
}

function rejectGuess(state, message) {
  const { event, eventSequence } = createEvent(state, {
    duration: 1700,
    message,
    row: state.guesses.length,
  })

  return {
    ...state,
    eventSequence,
    feedbackEvent: event,
    invalidEvent: event,
  }
}

export function createGameState(game) {
  return {
    ...game,
    eventSequence: 0,
    feedbackEvent: null,
    gameId: 0,
    inputLocked: false,
    invalidEvent: null,
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

    case 'submit-guess': {
      if (state.phase !== 'active') return state
      if (state.currentGuess.length !== state.wordLength) {
        return rejectGuess(state, 'Not enough letters')
      }
      if (!VALID_GUESSES[state.wordLength].has(state.currentGuess)) {
        return rejectGuess(state, 'Not in word list')
      }

      const evaluation = evaluateGuess(state.currentGuess, state.answer)
      const rowIndex = state.guesses.length
      const guesses = [...state.guesses, { word: state.currentGuess, evaluation }]
      const didWin = state.currentGuess === state.answer
      const didLose = !didWin && guesses.length === state.wordLength + 1
      const settledPhase = didWin ? 'won' : didLose ? 'lost' : 'active'

      return {
        ...state,
        currentGuess: '',
        feedbackEvent: null,
        guesses,
        invalidEvent: null,
        keyboardState: mergeKeyboardState(state.keyboardState, state.currentGuess, evaluation),
        pendingOutcome: {
          answer: state.answer,
          attemptCount: guesses.length,
          rowIndex,
          settledPhase,
        },
        phase: 'revealing',
      }
    }

    case 'complete-reveal': {
      if (!state.pendingOutcome) return state
      const { answer, attemptCount, settledPhase } = state.pendingOutcome

      if (settledPhase === 'active') {
        return { ...state, pendingOutcome: null, phase: 'active' }
      }

      const { event, eventSequence } = createEvent(state, {
        duration: settledPhase === 'lost' ? 4000 : 2400,
        message: settledPhase === 'lost' ? answer : attemptCount === 1 ? 'Genius' : 'Splendid',
      })

      return {
        ...state,
        eventSequence,
        feedbackEvent: event,
        pendingOutcome: null,
        phase: settledPhase,
      }
    }

    case 'start-game':
      return {
        ...state,
        answer: action.answer,
        currentGuess: '',
        feedbackEvent: null,
        gameId: state.gameId + 1,
        guesses: [],
        inputLocked: false,
        invalidEvent: null,
        keyboardState: {},
        pendingOutcome: null,
        phase: 'active',
        wordLength: action.wordLength,
      }

    case 'set-input-locked':
      if (state.inputLocked === action.value) return state
      return { ...state, inputLocked: action.value }

    default:
      return state
  }
}
