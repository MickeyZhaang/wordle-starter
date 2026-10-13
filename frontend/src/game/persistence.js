const GAME_STORAGE_KEY = 'wordle-game'

const VALID_PHASES = new Set(['active', 'won', 'lost'])
const VALID_RESULTS = new Set(['correct', 'present', 'absent'])

function isStoredGuess(value, wordLength) {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof value.word === 'string' &&
    value.word.length === wordLength &&
    /^[A-Z]+$/.test(value.word) &&
    Array.isArray(value.evaluation) &&
    value.evaluation.length === wordLength &&
    value.evaluation.every((result) => VALID_RESULTS.has(result))
  )
}

function isStoredGame(value) {
  if (value === null || typeof value !== 'object') return false
  const { answer, guesses, phase, wordLength } = value
  const maxAttempts = wordLength + 1

  const hasValidShape =
    Number.isInteger(wordLength) &&
    wordLength >= 5 &&
    wordLength <= 8 &&
    typeof answer === 'string' &&
    answer.length === wordLength &&
    /^[A-Z]+$/.test(answer) &&
    Array.isArray(guesses) &&
    guesses.length <= maxAttempts &&
    guesses.every((guess) => isStoredGuess(guess, wordLength)) &&
    VALID_PHASES.has(phase)

  if (!hasValidShape) return false
  const winningGuessIndex = guesses.findIndex((guess) => guess.word === answer)

  if (phase === 'active') {
    return guesses.length < maxAttempts && winningGuessIndex === -1
  }

  if (phase === 'won') {
    return winningGuessIndex === guesses.length - 1
  }

  return guesses.length === maxAttempts && winningGuessIndex === -1
}

function resolveStorage(storage) {
  return storage ?? window.localStorage
}

export function loadGameState(fallback, storage) {
  try {
    const storedGame = resolveStorage(storage).getItem(GAME_STORAGE_KEY)
    if (!storedGame) return fallback
    const parsedGame = JSON.parse(storedGame)
    return isStoredGame(parsedGame) ? { ...parsedGame, currentGuess: '' } : fallback
  } catch {
    return fallback
  }
}

export function saveGameState(game, storage) {
  try {
    resolveStorage(storage).setItem(GAME_STORAGE_KEY, JSON.stringify(game))
    return true
  } catch {
    return false
  }
}
