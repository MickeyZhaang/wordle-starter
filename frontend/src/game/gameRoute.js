const GAME_PATH_PATTERN =
  /^\/games\/([0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})\/?$/i

export function getGameIdFromPath(pathname = window.location.pathname) {
  return pathname.match(GAME_PATH_PATTERN)?.[1] ?? null
}

export function replaceGamePath(gameId) {
  window.history.replaceState(null, '', `/games/${gameId}`)
}
