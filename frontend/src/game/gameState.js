import { deriveKeyboardState, mergeKeyboardState } from './keyboardState.js'

export function createInitialGameState() {
  return {
    currentGuess: '',
    gameId: null,
    guesses: [],
    keyboardState: {},
    pendingOutcome: null,
    phase: 'active',
    remainingWordCount: null,
    requestPending: true,
    version: 0,
    wordLength: 5,
  }
}

function createLoadedGameState(game) {
  return {
    currentGuess: '',
    gameId: game.id,
    guesses: game.guesses,
    keyboardState: deriveKeyboardState(game.guesses),
    pendingOutcome: null,
    phase: game.status,
    remainingWordCount: game.remainingWordCount ?? null,
    requestPending: false,
    version: game.version,
    wordLength: game.wordLength,
  }
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'type-letter':
      if (
        state.phase !== 'active' ||
        state.requestPending ||
        !state.gameId ||
        state.currentGuess.length >= state.wordLength
      ) {
        return state
      }
      return { ...state, currentGuess: `${state.currentGuess}${action.letter}` }

    case 'delete-letter':
      if (state.phase !== 'active' || state.requestPending || state.currentGuess.length === 0) {
        return state
      }
      return { ...state, currentGuess: state.currentGuess.slice(0, -1) }

    case 'request-started':
      return { ...state, requestPending: true }

    case 'request-failed':
      return { ...state, requestPending: false }

    case 'game-loaded':
      return createLoadedGameState(action.game)

    case 'guess-accepted': {
      if (state.phase !== 'active') return state
      const game = action.game
      const acceptedGuess = game.guesses[game.guesses.length - 1]
      const rowIndex = game.guesses.length - 1

      return {
        ...state,
        currentGuess: '',
        gameId: game.id,
        guesses: game.guesses,
        keyboardState: mergeKeyboardState(
          state.keyboardState,
          acceptedGuess.word,
          acceptedGuess.evaluation,
        ),
        pendingOutcome: {
          answer: game.answer ?? null,
          attemptCount: game.guesses.length,
          rowIndex,
          settledPhase: game.status,
        },
        phase: 'revealing',
        remainingWordCount: game.remainingWordCount ?? state.remainingWordCount,
        requestPending: false,
        version: game.version,
        wordLength: game.wordLength,
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

    default:
      return state
  }
}
