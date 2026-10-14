const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '')

export class GameApiError extends Error {
  constructor(code, message, status = 0) {
    super(message)
    this.name = 'GameApiError'
    this.code = code
    this.status = status
  }
}

async function request(path, options = {}) {
  let response

  try {
    response = await fetch(`${API_URL}${path}`, options)
  } catch {
    throw new GameApiError('server_unavailable', 'Unable to reach the game server.')
  }

  let body

  try {
    body = await response.json()
  } catch {
    throw new GameApiError('invalid_response', 'The game server returned an invalid response.')
  }

  if (!response.ok) {
    throw new GameApiError(
      body?.error?.code ?? 'request_failed',
      body?.error?.message ?? 'The game request failed.',
      response.status,
    )
  }

  return body
}

export function createGame(wordLength) {
  return request('/games', {
    body: JSON.stringify({ wordLength }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
}

export function getGame(gameId) {
  return request(`/games/${gameId}`)
}

export function submitGuess(gameId, word, expectedVersion) {
  return request(`/games/${gameId}/guesses`, {
    body: JSON.stringify({ expectedVersion, word: word.toUpperCase() }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
}
