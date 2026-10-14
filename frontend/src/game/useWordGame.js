import { useEffect, useReducer, useRef, useState } from 'react'
import { createGame, getGame, submitGuess as submitGuessRequest } from './api.js'
import { createInitialGameState, gameReducer } from './gameState.js'
import { clearGameReference, loadGameReference, saveGameReference } from './persistence.js'

const INITIAL_WORD_LENGTH = 5
const INVALID_GUESS_CODES = new Set(['invalid_request', 'invalid_word', 'wrong_length'])
const INVALID_REFERENCE_CODES = new Set(['game_not_found', 'invalid_request'])

function requestEvent(error, row) {
  const isInvalidGuess = INVALID_GUESS_CODES.has(error?.code)

  return {
    duration: isInvalidGuess ? 1700 : 3000,
    message: error?.message ?? 'The game request failed.',
    row,
    type: isInvalidGuess ? 'invalid' : 'error',
  }
}

function useWordGame() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialGameState)
  const [event, setEvent] = useState(null)
  const eventSequence = useRef(0)
  const initializationStarted = useRef(false)
  const isMounted = useRef(false)
  const requestInFlight = useRef(false)
  const requestSequence = useRef(0)
  const {
    currentGuess,
    gameId,
    guesses,
    keyboardState,
    pendingOutcome,
    phase,
    requestPending,
    version,
    wordLength,
  } = state

  useEffect(() => {
    isMounted.current = true

    if (!initializationStarted.current) {
      initializationStarted.current = true
      requestInFlight.current = true
      requestSequence.current += 1
      const requestId = requestSequence.current

      const initialize = async () => {
        const reference = loadGameReference()

        try {
          let game = null

          if (reference) {
            try {
              game = await getGame(reference.id)
            } catch (error) {
              if (!INVALID_REFERENCE_CODES.has(error?.code)) throw error
              clearGameReference()
            }
          }

          if (!game) game = await createGame(reference?.wordLength ?? INITIAL_WORD_LENGTH)
          if (!isMounted.current || requestId !== requestSequence.current) return

          saveGameReference(game)
          dispatch({ type: 'game-loaded', game })
        } catch (error) {
          if (!isMounted.current || requestId !== requestSequence.current) return
          eventSequence.current += 1
          setEvent({ id: eventSequence.current, ...requestEvent(error) })
          dispatch({ type: 'request-failed' })
        } finally {
          if (requestId === requestSequence.current) requestInFlight.current = false
        }
      }

      initialize()
    }

    return () => {
      isMounted.current = false
    }
  }, [])

  const emitEvent = (values) => {
    eventSequence.current += 1
    setEvent({ id: eventSequence.current, ...values })
  }

  const typeLetter = (letter) => {
    dispatch({ type: 'type-letter', letter })
  }

  const deleteLetter = () => {
    dispatch({ type: 'delete-letter' })
  }

  const submitGuess = async () => {
    if (phase !== 'active' || requestPending || requestInFlight.current || !gameId) return

    if (currentGuess.length !== wordLength) {
      emitEvent({
        duration: 1700,
        message: 'Not enough letters',
        row: guesses.length,
        type: 'invalid',
      })
      return
    }

    requestInFlight.current = true
    requestSequence.current += 1
    const requestId = requestSequence.current
    dispatch({ type: 'request-started' })

    try {
      const game = await submitGuessRequest(gameId, currentGuess, version)
      if (!isMounted.current || requestId !== requestSequence.current) return

      setEvent(null)
      dispatch({ type: 'guess-accepted', game })
    } catch (error) {
      if (!isMounted.current || requestId !== requestSequence.current) return

      if (error?.code === 'stale_game') {
        try {
          const game = await getGame(gameId)
          if (!isMounted.current || requestId !== requestSequence.current) return

          saveGameReference(game)
          dispatch({ type: 'game-loaded', game })
          emitEvent({
            duration: 3000,
            message: 'Game updated from the server.',
            type: 'error',
          })
        } catch (refreshError) {
          if (!isMounted.current || requestId !== requestSequence.current) return
          dispatch({ type: 'request-failed' })
          emitEvent(requestEvent(refreshError, guesses.length))
        }
      } else {
        dispatch({ type: 'request-failed' })
        emitEvent(requestEvent(error, guesses.length))
      }
    } finally {
      if (requestId === requestSequence.current) requestInFlight.current = false
    }
  }

  const completeReveal = () => {
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
  }

  const startGame = async (nextWordLength) => {
    requestInFlight.current = true
    requestSequence.current += 1
    const requestId = requestSequence.current
    setEvent(null)
    dispatch({ type: 'request-started' })

    try {
      const game = await createGame(nextWordLength)
      if (!isMounted.current || requestId !== requestSequence.current) return

      saveGameReference(game)
      dispatch({ type: 'game-loaded', game })
    } catch (error) {
      if (!isMounted.current || requestId !== requestSequence.current) return
      dispatch({ type: 'request-failed' })
      emitEvent(requestEvent(error))
    } finally {
      if (requestId === requestSequence.current) requestInFlight.current = false
    }
  }

  return {
    completeReveal,
    currentGuess,
    deleteLetter,
    event,
    guesses,
    hasGame: Boolean(gameId),
    keyboardState,
    phase,
    requestPending,
    startGame,
    submitGuess,
    typeLetter,
    wordLength,
  }
}

export default useWordGame
