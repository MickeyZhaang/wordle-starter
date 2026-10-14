const GAME_STORAGE_KEY = 'wordle-game'

function isGameReference(value) {
  if (value === null || typeof value !== 'object') return false
  const { id, wordLength } = value

  return (
    typeof id === 'string' &&
    id.length > 0 &&
    Number.isInteger(wordLength) &&
    wordLength >= 5 &&
    wordLength <= 8
  )
}

function resolveStorage(storage) {
  return storage ?? window.localStorage
}

export function loadGameReference(storage) {
  try {
    const storedReference = resolveStorage(storage).getItem(GAME_STORAGE_KEY)
    if (!storedReference) return null
    const parsedReference = JSON.parse(storedReference)
    return isGameReference(parsedReference) ? parsedReference : null
  } catch {
    return null
  }
}

export function saveGameReference(game, storage) {
  try {
    resolveStorage(storage).setItem(
      GAME_STORAGE_KEY,
      JSON.stringify({ id: game.id, wordLength: game.wordLength }),
    )
    return true
  } catch {
    return false
  }
}

export function clearGameReference(storage) {
  try {
    resolveStorage(storage).removeItem(GAME_STORAGE_KEY)
    return true
  } catch {
    return false
  }
}
