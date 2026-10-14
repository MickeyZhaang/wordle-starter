const GAME_STORAGE_KEY = 'wordle-game'
const PLAYER_STORAGE_KEY = 'wordle-player'
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isUuid(value) {
  return typeof value === 'string' && UUID_PATTERN.test(value)
}

function isGameReference(value) {
  if (value === null || typeof value !== 'object') return false
  const { id, playerId, wordLength } = value

  return (
    isUuid(id) &&
    (playerId === undefined || isUuid(playerId)) &&
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

export function saveGameReference(game, playerId, storage) {
  try {
    resolveStorage(storage).setItem(
      GAME_STORAGE_KEY,
      JSON.stringify({ id: game.id, playerId, wordLength: game.wordLength }),
    )
    return true
  } catch {
    return false
  }
}

export function loadOrCreatePlayerId(storage) {
  const resolvedStorage = resolveStorage(storage)

  try {
    const storedPlayerId = resolvedStorage.getItem(PLAYER_STORAGE_KEY)
    if (isUuid(storedPlayerId)) return storedPlayerId
  } catch {
    return window.crypto.randomUUID()
  }

  const playerId = window.crypto.randomUUID()

  try {
    resolvedStorage.setItem(PLAYER_STORAGE_KEY, playerId)
  } catch {
    return playerId
  }

  return playerId
}

export function clearGameReference(storage) {
  try {
    resolveStorage(storage).removeItem(GAME_STORAGE_KEY)
    return true
  } catch {
    return false
  }
}
